import datetime
from collections import Counter
from bson import ObjectId
from bson.errors import InvalidId
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .mongodb import db
from .utils import hash_password
from .pipeline import try_advance_case, CONSULTATION_FEE

ADMIN_EMAIL = getattr(settings, 'ADMIN_EMAIL', 'eman@dermacare.com')
ADMIN_PASSWORD = getattr(settings, 'ADMIN_PASSWORD', 'Eman143@')


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        return Response({'message': 'ok'}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_stats(request):
    total_patients = db.users.count_documents({'role': 'patient'})
    total_doctors = db.users.count_documents({'role': 'doctor', 'is_active': True})
    total_consultations = db.cases.count_documents({'status': 'approved'})
    total_ai_scans = db.cases.count_documents({'confidence': {'$ne': None}})

    approved_count = db.cases.count_documents({'payment.status': 'Approved'})
    total_revenue = approved_count * CONSULTATION_FEE

    pending_moderation = db.cases.count_documents({'image_status': 'Pending Review'})
    pending_payments = db.cases.count_documents({'payment.status': 'Pending Verification'})

    breakdown = Counter()
    for c in db.cases.find({'disease_detected': {'$nin': [None, 'Unclear — Doctor Review Needed']}}):
        breakdown[c['disease_detected']] += 1
    disease_breakdown = [{'disease': k, 'count': v} for k, v in breakdown.most_common()]

    return Response({'stats': {
        'total_consultations': total_consultations,
        'total_ai_scans': total_ai_scans,
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_revenue': total_revenue,
        'pending_actions': pending_moderation + pending_payments,
        'disease_breakdown': disease_breakdown,
    }})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_moderation(request):
    cases = db.cases.find({}).sort('created_at', -1)
    result = []
    for c in cases:
        patient = db.users.find_one({'_id': c.get('patient_id')})
        result.append({
            'case_id': str(c['_id']),
            'scan_image': f"/media/image/{c['image_file_id']}/" if c.get('image_file_id') else None,
            'user_name': patient.get('full_name') if patient else 'Unknown',
            'condition': c.get('disease_detected') or 'Pending analysis',
            'image_status': c.get('image_status', 'Pending Review'),
        })
    return Response({'cases': result})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_moderation_action(request):
    case_id = request.data.get('case_id')
    action = request.data.get('action')
    if action not in ('Clear', 'Retake Requested'):
        return Response({'error': "Action must be 'Clear' or 'Retake Requested'."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        oid = ObjectId(case_id)
    except InvalidId:
        return Response({'error': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)

    db.cases.update_one({'_id': oid}, {'$set': {'image_status': action}})
    try_advance_case(oid)
    return Response({'message': 'ok'})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_payments(request):
    cases = db.cases.find({'payment': {'$ne': None}}).sort('created_at', -1)
    result = []
    for c in cases:
        patient = db.users.find_one({'_id': c.get('patient_id')})
        payment = c.get('payment', {})
        result.append({
            'payment_id': str(c['_id']),
            'case_id': str(c['_id']),
            'user_name': patient.get('full_name') if patient else 'Unknown',
            'transaction_id': payment.get('transaction_id'),
            'amount': payment.get('amount', CONSULTATION_FEE),
            'screenshot': f"/media/image/{payment['screenshot_file_id']}/" if payment.get('screenshot_file_id') else None,
            'status': payment.get('status', 'Pending Verification'),
        })
    return Response({'payments': result})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_payments_approve(request):
    case_id = request.data.get('case_id')
    try:
        oid = ObjectId(case_id)
    except InvalidId:
        return Response({'error': 'Invalid case ID.'}, status=status.HTTP_400_BAD_REQUEST)

    db.cases.update_one({'_id': oid}, {'$set': {'payment.status': 'Approved'}})
    try_advance_case(oid)
    return Response({'message': 'ok'})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_doctors(request):
    doctors = db.users.find({'role': 'doctor'})
    result = [{
        'name': d.get('full_name'),
        'email': d.get('email'),
        'specialty': d.get('specialty', 'Dermatologist'),
        'status': 'Active' if d.get('is_active', True) else 'Inactive',
    } for d in doctors]
    return Response({'doctors': result})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_doctors_add(request):
    data = request.data
    full_name, email, password = data.get('full_name'), data.get('email'), data.get('password')
    if not all([full_name, email, password]):
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if db.users.find_one({'email': email}):
        return Response({'error': 'This email is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    db.users.insert_one({
        'full_name': full_name, 'email': email,
        'password': hash_password(password), 'role': 'doctor',
        'specialty': data.get('specialty') or 'Dermatologist',
        'is_doctor_approved': True, 'is_active': True,
        'created_at': datetime.datetime.utcnow(),
    })
    return Response({'message': 'Doctor added successfully.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_doctors_toggle(request):
    email = request.data.get('email')
    doctor = db.users.find_one({'email': email, 'role': 'doctor'})
    if not doctor:
        return Response({'error': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)
    db.users.update_one({'_id': doctor['_id']}, {'$set': {'is_active': not doctor.get('is_active', True)}})
    return Response({'message': 'ok'})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_doctors_delete(request):
    email = request.data.get('email')
    result = db.users.delete_one({'email': email, 'role': 'doctor'})
    if result.deleted_count == 0:
        return Response({'error': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Doctor deleted successfully.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_patients(request):
    patients = db.users.find({'role': 'patient'})
    result = []
    for p in patients:
        total_scans = db.cases.count_documents({'patient_id': p['_id']})
        result.append({
            'name': p.get('full_name'), 'email': p.get('email'),
            'age': p.get('age'), 'total_scans': total_scans,
        })
    return Response({'patients': result})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_all_cases(request):
    cases = db.cases.find({}).sort('created_at', -1)
    result = []
    for c in cases:
        patient = db.users.find_one({'_id': c.get('patient_id')})
        result.append({
            'id': c.get('case_number', str(c['_id'])),
            'name': patient.get('full_name') if patient else 'Unknown',
            'issue': c.get('disease_detected') or 'Pending analysis',
            'status': c.get('status'),
            'date': c.get('created_at').isoformat() if c.get('created_at') else None,
        })
    return Response({'cases': result})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_ai_analysis(request):
    cases = db.cases.find({'confidence': {'$ne': None}}).sort('created_at', -1)
    result = []
    for c in cases:
        patient = db.users.find_one({'_id': c.get('patient_id')})
        result.append({
            'case_id': str(c['_id']),
            'case_number': c.get('case_number', str(c['_id'])),
            'user_name': patient.get('full_name') if patient else 'Unknown',
            'scan_image': f"/media/image/{c['image_file_id']}/" if c.get('image_file_id') else None,
            'disease_detected': c.get('disease_detected'),
            'confidence': c.get('confidence'),
            'suggested_medicine': c.get('suggested_medicine'),
            'status': c.get('status'),
            'doctor_note': c.get('doctor_note'),
            'created_at': c.get('created_at').isoformat() if c.get('created_at') else None,
        })
    return Response({'cases': result})