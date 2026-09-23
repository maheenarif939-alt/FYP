import datetime
import random
from bson import ObjectId
from bson.errors import InvalidId
from gridfs import GridFS
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .mongodb import db
from .auth import make_tokens, IsAuthenticatedMongo, IsPatient, IsDoctor
from .utils import (
    hash_password, verify_password, next_case_number, serialize_user, serialize_case,
    validate_password_strength,
)
from .pipeline import try_advance_case, CONSULTATION_FEE

OTP_EXPIRY_MINUTES = 10


# Accounts 

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    data = request.data
    full_name, email = data.get('full_name'), data.get('email')
    age, password, password2 = data.get('age'), data.get('password'), data.get('password2')

    if not all([full_name, email, password, password2]):
        return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != password2:
        return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    strength_error = validate_password_strength(password)
    if strength_error:
        return Response({'detail': strength_error}, status=status.HTTP_400_BAD_REQUEST)

    existing = db.users.find_one({'email': email})
    if existing:
        
        if not existing.get('email_verified', True):
            db.users.delete_one({'_id': existing['_id']})
            db.email_verifications.delete_many({'email': email, 'role': 'patient'})
        else:
            return Response({'detail': 'This email is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    user_doc = {
        'full_name': full_name, 'email': email,
        'age': int(age) if age else None,
        'password': hash_password(password),
        'role': 'patient',
        'email_verified': False,
        'created_at': datetime.datetime.utcnow(),
    }
    result = db.users.insert_one(user_doc)
    user_doc['_id'] = result.inserted_id

    code = str(random.randint(100000, 999999))
    db.email_verifications.delete_many({'email': email, 'role': 'patient'})
    db.email_verifications.insert_one({
        'email': email, 'role': 'patient', 'code': code,
        'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES),
        'created_at': datetime.datetime.utcnow(),
    })
    try:
        send_mail(
            subject='DermaCareMe — Verify Your Email',
            message=f'Your email verification code is: {code}\n\nThis code will expire in {OTP_EXPIRY_MINUTES} minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print("=== SIGNUP EMAIL SEND ERROR ===")
        print(e)

    return Response({
        'message': 'Account created! Please check your email for a verification code.',
        'email': email,
        'role': 'patient',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def doctor_signup(request):
    data = request.data
    full_name, email = data.get('full_name'), data.get('email')
    password, password2 = data.get('password'), data.get('password2')

    if not all([full_name, email, password, password2]):
        return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != password2:
        return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    strength_error = validate_password_strength(password)
    if strength_error:
        return Response({'detail': strength_error}, status=status.HTTP_400_BAD_REQUEST)

    if db.users.find_one({'email': email}):
        return Response({'detail': 'This email is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    user_doc = {
        'full_name': full_name, 'email': email,
        'password': hash_password(password), 'role': 'doctor',
        'specialty': data.get('specialty', 'Dermatologist'),
        'phone': data.get('phone'), 'hospital': data.get('hospital'),
        'experience_years': data.get('experience_years'),
        'is_doctor_approved': True, 'is_active': True,
        'email_verified': True,
        'created_at': datetime.datetime.utcnow(),
    }
    result = db.users.insert_one(user_doc)
    user_doc['_id'] = result.inserted_id

    return Response({
        'message': 'Doctor account created successfully!',
        'tokens': make_tokens(user_doc['_id'], 'doctor'),
        'user': serialize_user(user_doc),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    email, password, role = data.get('email'), data.get('password'), data.get('role')

    user = db.users.find_one({'email': email, 'role': role})
    if not user or not verify_password(password, user.get('password')):
        return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

    if role == 'doctor' and not user.get('is_active', True):
        return Response({'detail': 'Your account has been deactivated by the admin.'}, status=status.HTTP_403_FORBIDDEN)

    #  default True 
    if not user.get('email_verified', True):
        return Response(
            {'detail': 'Please verify your email before logging in.', 'needs_verification': True, 'email': email},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response({
        'message': 'Login successful!',
        'tokens': make_tokens(user['_id'], role),
        'user': serialize_user(user),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def profile(request):
    return Response(serialize_user(request.mongo_user), status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticatedMongo])
def update_profile(request):
    data = request.data
    allowed_fields = ['full_name', 'phone', 'specialty', 'hospital', 'experience_years']
    update_data = {}
    for field in allowed_fields:
        if field in data and data.get(field) not in (None, ''):
            value = data.get(field)
            if field == 'experience_years':
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    continue
            update_data[field] = value

    if update_data:
        db.users.update_one({'_id': request.mongo_user['_id']}, {'$set': update_data})
        request.mongo_user.update(update_data)

    return Response(serialize_user(request.mongo_user), status=status.HTTP_200_OK)


class UploadVerificationDocView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsDoctor]

    def post(self, request):
        doc = request.FILES.get('document')
        if not doc:
            return Response({'detail': 'A document file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        fs = GridFS(db)
        file_id = fs.put(doc.read(), filename=doc.name, content_type=doc.content_type)

        db.users.update_one(
            {'_id': request.mongo_user['_id']},
            {'$set': {'verification_doc_file_id': str(file_id), 'is_doctor_approved': False}}
        )
        request.mongo_user['verification_doc_file_id'] = str(file_id)
        request.mongo_user['is_doctor_approved'] = False

        return Response(serialize_user(request.mongo_user), status=status.HTTP_200_OK)


#  Email Verification 

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    email = request.data.get('email')
    role = request.data.get('role')
    code = request.data.get('code')

    if not all([email, role, code]):
        return Response({'detail': 'Email, role and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    record = db.email_verifications.find_one({'email': email, 'role': role, 'code': code})
    if not record:
        return Response({'detail': 'Invalid or expired verification code.'}, status=status.HTTP_400_BAD_REQUEST)
    if record['expires_at'] < datetime.datetime.utcnow():
        db.email_verifications.delete_one({'_id': record['_id']})
        return Response({'detail': 'This code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    user = db.users.find_one({'email': email, 'role': role})
    if not user:
        return Response({'detail': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

    db.users.update_one({'_id': user['_id']}, {'$set': {'email_verified': True}})
    db.email_verifications.delete_one({'_id': record['_id']})
    user['email_verified'] = True

    return Response({
        'message': 'Email verified successfully!',
        'tokens': make_tokens(user['_id'], role),
        'user': serialize_user(user),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    email = request.data.get('email')
    role = request.data.get('role')

    user = db.users.find_one({'email': email, 'role': role})
    if not user:
        return Response({'message': 'If this account exists, a new code has been sent.'}, status=status.HTTP_200_OK)
    if user.get('email_verified', False):
        return Response({'detail': 'This email is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

    code = str(random.randint(100000, 999999))
    db.email_verifications.delete_many({'email': email, 'role': role})
    db.email_verifications.insert_one({
        'email': email, 'role': role, 'code': code,
        'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES),
        'created_at': datetime.datetime.utcnow(),
    })
    try:
        send_mail(
            subject='DermaCareMe — Verify Your Email',
            message=f'Your email verification code is: {code}\n\nThis code will expire in {OTP_EXPIRY_MINUTES} minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print("=== RESEND VERIFICATION EMAIL ERROR ===")
        print(e)
        return Response({'detail': 'Could not send the email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'A new verification code has been sent.'}, status=status.HTTP_200_OK)


#  Password Reset 

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    role = request.data.get('role')

    if not email or not role:
        return Response({'detail': 'Email and role are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = db.users.find_one({'email': email, 'role': role})
    if not user:
        return Response({'message': 'If this email is registered, a reset code has been sent.'}, status=status.HTTP_200_OK)

    code = str(random.randint(100000, 999999))
    db.password_resets.delete_many({'email': email, 'role': role})
    db.password_resets.insert_one({
        'email': email, 'role': role, 'code': code,
        'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES),
        'created_at': datetime.datetime.utcnow(),
    })

    try:
        send_mail(
            subject='DermaCareMe — Password Reset Code',
            message=(
                f'Your password reset code is: {code}\n\n'
                f'This code will expire in {OTP_EXPIRY_MINUTES} minutes.\n\n'
                f'If you did not request this, you can safely ignore this email.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print("=== EMAIL SEND ERROR ===")
        print(e)
        return Response({'detail': 'Could not send the reset email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'If this email is registered, a reset code has been sent.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    role = request.data.get('role')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    new_password2 = request.data.get('new_password2')

    if not all([email, role, code, new_password, new_password2]):
        return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if new_password != new_password2:
        return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    strength_error = validate_password_strength(new_password)
    if strength_error:
        return Response({'detail': strength_error}, status=status.HTTP_400_BAD_REQUEST)

    reset_doc = db.password_resets.find_one({'email': email, 'role': role, 'code': code})
    if not reset_doc:
        return Response({'detail': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)
    if reset_doc['expires_at'] < datetime.datetime.utcnow():
        db.password_resets.delete_one({'_id': reset_doc['_id']})
        return Response({'detail': 'This reset code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    user = db.users.find_one({'email': email, 'role': role})
    if not user:
        return Response({'detail': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

    db.users.update_one({'_id': user['_id']}, {'$set': {'password': hash_password(new_password)}})
    db.password_resets.delete_one({'_id': reset_doc['_id']})

    return Response({'message': 'Password reset successfully. You can now log in.'}, status=status.HTTP_200_OK)


# Cases 

class UploadCaseView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsPatient]

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'detail': 'An image is required.'}, status=status.HTTP_400_BAD_REQUEST)

        fs = GridFS(db)
        file_id = fs.put(image.read(), filename=image.name, content_type=image.content_type)

        case_doc = {
            'patient_id': request.mongo_user['_id'],
            'case_number': next_case_number(),
            'image_file_id': str(file_id),
            'status': 'uploaded',
            'image_status': 'Pending Review',
            'disease_detected': None, 'confidence': None, 'suggested_medicine': None, 'doctor_note': None,
            'created_at': datetime.datetime.utcnow(),
        }
        result = db.cases.insert_one(case_doc)
        case_doc['_id'] = result.inserted_id

        return Response(serialize_case(case_doc, request), status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsPatient])
def my_cases(request):
    cases = db.cases.find({'patient_id': request.mongo_user['_id']}).sort('created_at', -1)
    return Response([serialize_case(c, request, include_patient=False) for c in cases])


@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def case_detail(request, case_id):
    try:
        case = db.cases.find_one({'_id': ObjectId(case_id)})
    except InvalidId:
        return Response({'detail': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)
    if not case:
        return Response({'detail': 'Case not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serialize_case(case, request))


@api_view(['POST'])
@permission_classes([IsAuthenticatedMongo])
def analyze_case(request, case_id):
    try:
        oid = ObjectId(case_id)
    except InvalidId:
        return Response({'detail': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)

    case = try_advance_case(oid)
    if not case:
        return Response({'detail': 'Case not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serialize_case(case, request))


@api_view(['GET'])
@permission_classes([IsDoctor])
def pending_cases(request):
    cases = db.cases.find({'status': 'doctor_pending'}).sort('created_at', 1)
    return Response([serialize_case(c, request) for c in cases])


@api_view(['GET'])
@permission_classes([IsDoctor])
def approved_cases(request):
    cases = db.cases.find({'status': 'approved'}).sort('created_at', -1)
    return Response([serialize_case(c, request) for c in cases])


@api_view(['GET'])
@permission_classes([IsDoctor])
def all_cases(request):
    cases = db.cases.find({'status': {'$in': ['doctor_pending', 'approved', 'rejected']}}).sort('created_at', -1)
    return Response([serialize_case(c, request) for c in cases])


@api_view(['POST'])
@permission_classes([IsDoctor])
def verify_case(request, case_id):
    action = request.data.get('action')
    doctor_note = request.data.get('doctor_note', '')
    medicine = request.data.get('medicine')

    if action not in ('approve', 'reject'):
        return Response({'detail': "Action must be 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        case = db.cases.find_one({'_id': ObjectId(case_id)})
    except InvalidId:
        return Response({'detail': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)
    if not case:
        return Response({'detail': 'Case not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = 'approved' if action == 'approve' else 'rejected'
    update = {'status': new_status, 'doctor_note': doctor_note}
    if medicine:
        update['suggested_medicine'] = medicine

    db.cases.update_one({'_id': case['_id']}, {'$set': update})
    case.update(update)
    return Response(serialize_case(case, request))


@api_view(['DELETE'])
@permission_classes([IsPatient])
def delete_case(request, case_id):
    try:
        oid = ObjectId(case_id)
    except InvalidId:
        return Response({'detail': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)

    case = db.cases.find_one({'_id': oid})
    if not case:
        return Response({'detail': 'Case not found.'}, status=status.HTTP_404_NOT_FOUND)

    if case.get('patient_id') != request.mongo_user['_id']:
        return Response({'detail': 'You are not allowed to delete this case.'}, status=status.HTTP_403_FORBIDDEN)

    fs = GridFS(db)
    try:
        fs.delete(ObjectId(case['image_file_id']))
    except Exception:
        pass

    payment = case.get('payment') or {}
    if payment.get('screenshot_file_id'):
        try:
            fs.delete(ObjectId(payment['screenshot_file_id']))
        except Exception:
            pass

    db.cases.delete_one({'_id': oid})
    return Response({'message': 'Case deleted successfully.'}, status=status.HTTP_200_OK)


#  Payments 

class SubmitPaymentView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsPatient]

    def post(self, request, case_id):
        try:
            case = db.cases.find_one({'_id': ObjectId(case_id)})
        except InvalidId:
            return Response({'detail': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)
        if not case:
            return Response({'detail': 'Case not found.'}, status=status.HTTP_404_NOT_FOUND)

        transaction_id = request.data.get('transaction_id')
        method = request.data.get('method', 'jazzcash')
        screenshot = request.FILES.get('screenshot')

        if not transaction_id or not screenshot:
            return Response({'detail': 'Transaction ID and screenshot are required.'}, status=status.HTTP_400_BAD_REQUEST)

        fs = GridFS(db)
        screenshot_id = fs.put(screenshot.read(), filename=screenshot.name, content_type=screenshot.content_type)

        db.cases.update_one({'_id': case['_id']}, {'$set': {
            'status': 'payment_pending',
            'payment': {
                'transaction_id': transaction_id, 'method': method, 'amount': CONSULTATION_FEE,
                'status': 'Pending Verification',
                'screenshot_file_id': str(screenshot_id),
                'submitted_at': datetime.datetime.utcnow(),
            },
        }})
        return Response({'message': 'Payment submitted successfully!'}, status=status.HTTP_201_CREATED)


#  Media 

def serve_image(request, file_id):
    fs = GridFS(db)
    try:
        grid_out = fs.get(ObjectId(file_id))
    except Exception:
        raise Http404('Image not found.')
    return HttpResponse(grid_out.read(), content_type=grid_out.content_type or 'image/jpeg')