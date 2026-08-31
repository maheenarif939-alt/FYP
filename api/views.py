from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny

from gridfs import GridFS
from .mongodb import db


from .serializers import  SignupSerializer, LoginSerializer, ProfileSerializer, DoctorDashboardSerializer, PendingCaseSerializer, DoctorVerifySerializer, ApprovedCaseSerializer, ApprovedCaseViewSerializer, ApprovedCaseDetailsSerializer, AllCasesSerializer,  DoctorProfileSerializer,  HistorySerializer, DashboardSerializer, DoctorProfileSerializer, DoctorAccountSerializer



@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        user_data = serializer.validated_data

        return Response(
            {
                "message": "Account created successfully!",
                "user": {
                    "full_name": user_data["full_name"],
                    "email": user_data["email"],
                    "age": user_data["age"]
                }
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
# login

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user_data = serializer.validated_data

        return Response(
            {
                "message": "Login successful!",
                "user": {
                    "email": user_data["email"],
                    "role": user_data["role"]
                }
            },
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
    
# profile

@api_view(['GET'])
def profile(request):
    data = {
        "full_name": "Eman Fatima",
        "email": "eman.fatima@example.com",
        "total_scans": 12,
        "verified": 5
    }

    serializer = ProfileSerializer(data)

    return Response(
        {
            "message": "Profile loaded successfully!",
            "user": serializer.data
        },
        status=status.HTTP_200_OK
    )

# Imageupload

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        image = request.FILES.get("image")

        if not image:
            return Response(
                {"error": "No image provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            fs = GridFS(db)

            file_id = fs.put(
                image.read(),
                filename=image.name,
                content_type=image.content_type
            )

            image_data = {
                "file_id": str(file_id),
                "filename": image.name,
                "content_type": image.content_type,
                "status": "Pending Analysis"
            }

            db.image_uploads.insert_one(image_data)

            return Response(
                {
                    "message": "Image uploaded successfully",
                    "file_id": str(file_id),
                    "filename": image.name,
                    "status": "Pending Analysis"
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Payment

class PaymentView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):

        unique_id = request.data.get("unique_id")
        transaction_id = request.data.get("transaction_id")
        payment_method = request.data.get("payment_method", "JazzCash")
        screenshot = request.FILES.get("payment_screenshot")

        # Check required fields
        if not unique_id:
            return Response(
                {"error": "Unique ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not transaction_id:
            return Response(
                {"error": "Transaction ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not screenshot:
            return Response(
                {"error": "Payment screenshot is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Save screenshot in MongoDB GridFS
            fs = GridFS(db)

            screenshot_id = fs.put(
                screenshot.read(),
                filename=screenshot.name,
                content_type=screenshot.content_type
            )

            # Save payment information
            payment_data = {
                "unique_id": unique_id,
                "transaction_id": transaction_id,
                "payment_method": payment_method,
                "amount": 500,
                "screenshot_id": str(screenshot_id),
                "status": "Pending"
            }

            result = db.payments.insert_one(payment_data)

            return Response(
                {
                    "message": "Payment submitted successfully!",
                    "payment_id": str(result.inserted_id),
                    "unique_id": unique_id,
                    "transaction_id": transaction_id,
                    "amount": 500,
                    "payment_method": payment_method,
                    "status": "Pending"
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Case Tracking

@api_view(['GET'])
def case_tracking(request):

    try:
        # Latest case find karo
        case = db.cases.find_one(
            {},
            sort=[("_id", -1)]
        )

        if not case:
            return Response(
                {
                    "message": "No case found",
                    "case": None
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "message": "Case tracking loaded successfully!",
                "case": {
                    "case_id": case.get("case_id"),
                    "status": case.get("status"),
                    "submitted": case.get("submitted"),
                    "type": case.get("type"),

                    "steps": {
                        "image_uploaded": case.get(
                            "image_uploaded", False
                        ),

                        "payment_verified": case.get(
                            "payment_verified", False
                        ),

                        "ai_analysis": case.get(
                            "ai_analysis", "Pending"
                        ),

                        "doctor_verification": case.get(
                            "doctor_verification", "Pending"
                        ),

                        "completed": case.get(
                            "completed", False
                        )
                    }
                }
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Result

@api_view(['GET'])
def result(request):

    case_id = request.GET.get('id')

    case = db.cases.find_one({"case_id": case_id})

    if not case:
        return Response(
            {"message": "Result not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        {
            "message": "Result loaded successfully!",
            "result": {
                "case_id": case.get("case_id"),
                "image": case.get("image"),
                "status": case.get("doctor_verification"),
                "disease": case.get("disease"),
                "confidence": case.get("confidence"),
                "medicine": case.get("medicine", []),
                "doctor_note": case.get("doctor_note")
            }
        },
        status=status.HTTP_200_OK
    )

# Doctor Dashboard

@api_view(['GET'])
def doctor_dashboard(request):

    data = {
        "total_cases": 145,
        "pending_cases": 12,
        "approved_cases": 133,

        "recent_cases": [
            {
                "id": "1",
                "name": "Eman Fatima",
                "status": "pending",
                "date": "June 24, 2026"
            },
            {
                "id": "2",
                "name": "Ali Khan",
                "status": "pending",
                "date": "June 23, 2026"
            },
            {
                "id": "3",
                "name": "Sara Ahmed",
                "status": "approved",
                "date": "June 22, 2026"
            },
            {
                "id": "4",
                "name": "Bilal Ahmed",
                "status": "pending",
                "date": "June 21, 2026"
            },
            {
                "id": "5",
                "name": "Zoya Khan",
                "status": "approved",
                "date": "June 20, 2026"
            }
        ]
    }

    serializer = DoctorDashboardSerializer(data)

    return Response(
        {
            "message": "Doctor dashboard loaded successfully!",
            "dashboard": serializer.data
        },
        status=status.HTTP_200_OK
    )

# Pending Cases

@api_view(['GET'])
def pending_cases(request):

    data = [
        {
            "id": "1",
            "name": "Eman Fatima",
            "issue": "Facial Skin Analysis",
            "status": "pending"
        },
        {
            "id": "2",
            "name": "Ali Khan",
            "issue": "Acne",
            "status": "pending"
        },
        {
            "id": "4",
            "name": "Bilal Ahmed",
            "issue": "Pigmentation",
            "status": "pending"
        }
    ]

    serializer = PendingCaseSerializer(data, many=True)

    return Response(
        {
            "message": "Pending cases loaded successfully!",
            "cases": serializer.data
        },
        status=status.HTTP_200_OK
    )

# Doctor Verify Case

@api_view(['GET', 'POST'])
def doctor_verify(request):

    # GET: Doctor ko case ki AI information milegi
    if request.method == 'GET':

        case_data = {
            "id": "1",
            "patient_name": "Eman Fatima",
            "ai_detection": {
                "disease": "Eczema",
                "confidence": "92%",
                "severity": "Mild",
                "recommendations": "Skin hydration recommended"
            },
            "status": "pending"
        }

        return Response(
            {
                "message": "Case loaded successfully!",
                "case": case_data
            },
            status=status.HTTP_200_OK
        )

    # POST: Doctor apna final result submit karega
    if request.method == 'POST':

        serializer = DoctorVerifySerializer(data=request.data)

        if serializer.is_valid():

            data = serializer.validated_data

            return Response(
                {
                    "message": "Case verified and result sent successfully!",
                    "case": {
                        "status": "approved",
                        "diagnosis": data["diagnosis"],
                        "medication": data["medication"],
                        "notes": data.get("notes", "")
                    }
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# Approved Cases

@api_view(['GET'])
def approved_cases(request):

    data = [
        {
            "id": "3",
            "name": "Sara Ahmed",
            "issue": "Eczema",
            "status": "approved"
        },
        {
            "id": "5",
            "name": "Zoya Khan",
            "issue": "Acne",
            "status": "approved"
        }
    ]

    serializer = ApprovedCaseSerializer(data, many=True)

    return Response(
        {
            "message": "Approved cases loaded successfully!",
            "cases": serializer.data
        },
        status=status.HTTP_200_OK
    )

# Approved Case View

@api_view(['GET'])
def approved_case_view(request):

    case_data = {
        "id": "3",
        "patient_name": "Sara Ahmed",
        "image": "http://127.0.0.1:8000/media/cases/sara.jpg",
        "disease": "Eczema",
        "confidence": "92% Accuracy",
        "medicine": "Hydrocortisone Cream 1%",
        "doctor_note": "Please apply the cream twice daily on the affected area. Avoid direct sunlight and keep the skin hydrated.",
        "status": "approved"
    }

    serializer = ApprovedCaseViewSerializer(case_data)

    return Response(
        {
            "message": "Approved case details loaded successfully!",
            "case": serializer.data
        },
        status=status.HTTP_200_OK
    )

# approved case detail

@api_view(['GET'])
def approved_case_details(request, case_id):

    # Temporary data
    # Baad mein MongoDB se ye data ayega
    case = {
        "id": case_id,
        "name": "Eman Fatima",
        "condition": "Eczema",
        "ai_prediction": "Eczema - 92% Accuracy",
        "medicine": "Hydrocortisone Cream 1%",
        "note": "Please apply the cream twice daily on the affected area. Avoid direct sunlight and keep the skin hydrated.",
        "image_uri": "https://via.placeholder.com/300"
    }

    serializer = ApprovedCaseDetailsSerializer(case)

    return Response(
        {
            "message": "Approved case details loaded successfully!",
            "case": serializer.data
        },
        status=status.HTTP_200_OK
    )

# all-cases

@api_view(['GET'])
def all_cases(request):

    cases = [
        {
            "id": "1",
            "name": "Eman Fatima",
            "issue": "Facial Skin Analysis",
            "status": "pending",
            "date": "June 24, 2026"
        },
        {
            "id": "2",
            "name": "Ali Khan",
            "issue": "Acne Detection",
            "status": "pending",
            "date": "June 23, 2026"
        },
        {
            "id": "3",
            "name": "Sara Ahmed",
            "issue": "Eczema",
            "status": "approved",
            "date": "June 22, 2026"
        },
        {
            "id": "4",
            "name": "Bilal Ahmed",
            "issue": "Pigmentation",
            "status": "pending",
            "date": "June 21, 2026"
        },
        {
            "id": "5",
            "name": "Zoya Khan",
            "issue": "Blackheads",
            "status": "approved",
            "date": "June 20, 2026"
        }
    ]

    serializer = AllCasesSerializer(cases, many=True)

    return Response(
        {
            "message": "All cases loaded successfully!",
            "cases": serializer.data
        },
        status=status.HTTP_200_OK
    )

# doctor-profile

@api_view(['GET'])
def doctor_profile(request):

    doctor_data = {
        "id": "DOC-001",
        "name": "Dr. Sarah Khan",
        "specialty": "Dermatologist",
        "phone": "+92 300 1234567",
        "email": "dr.sarah@dermacare.com",
        "qualification": "MBBS, FCPS",
        "profile_image": "https://via.placeholder.com/300"
    }

    serializer = DoctorProfileSerializer(doctor_data)

    return Response(
        {
            "message": "Doctor profile loaded successfully!",
            "doctor": serializer.data
        },
        status=status.HTTP_200_OK
    )
# history

@api_view(['GET'])
def history(request):

    history_data = [
        {
            "id": "1",
            "date": "23 June 2026",
            "disease": "Dermatitis",
            "status": "Verified"
        },
        {
            "id": "2",
            "date": "21 June 2026",
            "disease": "Eczema",
            "status": "Verified"
        },
        {
            "id": "3",
            "date": "19 July 2026",
            "disease": "Scanning...",
            "status": "Pending"
        }
    ]

    serializer = HistorySerializer(history_data, many=True)

    return Response(
        {
            "message": "Scanning history loaded successfully!",
            "history": serializer.data
        },
        status=status.HTTP_200_OK
    )

# dashboard

@api_view(['GET'])
def dashboard(request):

    data = {
        "full_name": "Eman",
        "notifications_count": 0
    }

    serializer = DashboardSerializer(data)

    return Response({
        "success": True,
        "message": "Dashboard data loaded successfully",
        "data": serializer.data
    })

# doctor page

@api_view(['GET'])
def doctor_profile(request):
    doctor_data = {
        "id": "1",
        "name": "Dr. Sarah Ahmed",
        "specialty": "Senior Dermatologist",
        "rating": "4.9",
        "reviews_count": 120,
        "email": "dr.sarah@dermacare.com",
        "phone": "+92 300 1234567",
        "clinic": "Dermatology Center, Lahore",
        "about": (
            "Dr. Sarah is a certified dermatologist with over 10 years "
            "of experience in skin analysis and treatment. "
            "She specializes in AI-assisted diagnosis and patient care."
        ),
        "profile_image": (
            "https://img.freepik.com/free-photo/"
            "friendly-doctor-smiling-camera_23-2148148633.jpg"
        )
    }

    serializer = DoctorProfileSerializer(data=doctor_data)

    if serializer.is_valid():
        return Response({
            "success": True,
            "message": "Doctor profile loaded successfully.",
            "data": serializer.validated_data
        })

    return Response({
        "success": False,
        "errors": serializer.errors
    }, status=400)

# doctor account

@api_view(['GET'])
def doctor_account(request):

    doctor_data = {
        "id": "1",
        "name": "Dr. Eman Fatima",
        "specialty": "Senior Dermatologist",
        "email": "dr.eman@dermacare.com",
        "phone": "+92 300 1234567",
        "hospital": "City General Hospital",
        "experience": "5 Years",
        "profile_image": "doctor-placeholder.png"
    }

    serializer = DoctorAccountSerializer(data=doctor_data)

    if serializer.is_valid():
        return Response({
            "success": True,
            "message": "Doctor account loaded successfully.",
            "data": serializer.validated_data
        })

    return Response({
        "success": False,
        "errors": serializer.errors
    }, status=400)