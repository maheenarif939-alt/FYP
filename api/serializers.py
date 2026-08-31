from rest_framework import serializers


class SignupSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    age = serializers.IntegerField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return data

# login

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["patient", "doctor"])

# profile

class ProfileSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    email = serializers.EmailField()
    total_scans = serializers.IntegerField()
    verified = serializers.IntegerField()

# doctor dashboard

class DoctorCaseSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    status = serializers.CharField()
    date = serializers.CharField()


class DoctorDashboardSerializer(serializers.Serializer):
    total_cases = serializers.IntegerField()
    pending_cases = serializers.IntegerField()
    approved_cases = serializers.IntegerField()
    recent_cases = DoctorCaseSerializer(many=True)

# pending-cases

class PendingCaseSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    issue = serializers.CharField()
    status = serializers.CharField()

# doctor-verify

class DoctorVerifySerializer(serializers.Serializer):
    diagnosis = serializers.CharField(required=True)
    medication = serializers.CharField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)

# approved cases

class ApprovedCaseSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    issue = serializers.CharField()
    status = serializers.CharField()

# approved-case-view

class ApprovedCaseViewSerializer(serializers.Serializer):
    id = serializers.CharField()
    patient_name = serializers.CharField()
    image = serializers.CharField()
    disease = serializers.CharField()
    confidence = serializers.CharField()
    medicine = serializers.CharField()
    doctor_note = serializers.CharField()
    status = serializers.CharField()

# approvedcase detail

class ApprovedCaseDetailsSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    condition = serializers.CharField()
    ai_prediction = serializers.CharField()
    medicine = serializers.CharField()
    note = serializers.CharField()
    image_uri = serializers.CharField()

# all cases

class AllCasesSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    issue = serializers.CharField()
    status = serializers.CharField()
    date = serializers.CharField()

# doctor profile

class DoctorProfileSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    specialty = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField()
    qualification = serializers.CharField()
    profile_image = serializers.CharField()

# history

class HistorySerializer(serializers.Serializer):
    id = serializers.CharField()
    date = serializers.CharField()
    disease = serializers.CharField()
    status = serializers.CharField()

# dashboard

class DashboardSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    notifications_count = serializers.IntegerField()

# doctor page

class DermatologistSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    specialty = serializers.CharField()
    rating = serializers.CharField()
    reviews_count = serializers.IntegerField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    clinic = serializers.CharField()
    about = serializers.CharField()
    profile_image = serializers.CharField()

# doctor account

class DoctorAccountSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    specialty = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    hospital = serializers.CharField()
    experience = serializers.CharField()
    profile_image = serializers.CharField()