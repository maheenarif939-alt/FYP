import datetime
from django.contrib.auth.hashers import make_password, check_password
from .mongodb import db


def hash_password(raw):
    return make_password(raw)


def verify_password(raw, hashed):
    return check_password(raw, hashed or '')


def next_case_number():
    counter = db.counters.find_one_and_update(
        {'_id': 'case_number'},
        {'$inc': {'seq': 1}},
        upsert=True,
        return_document=True,
    )
    seq = counter['seq'] if counter else 1
    return f"CASE-{seq:04d}"


def next_payment_reference():
    """Generates a unique reference ID for each payment, e.g. DCA-000000001,
    which is visible to both the patient and the admin."""
    counter = db.counters.find_one_and_update(
        {'_id': 'payment_reference'},
        {'$inc': {'seq': 1}},
        upsert=True,
        return_document=True,
    )
    seq = counter['seq'] if counter else 1
    return f"DCA-{seq:09d}"

SPECIAL_CHARS = set('!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\')

def validate_password_strength(password):
    if not password or len(password) < 8:
        return 'Password must be at least 8 characters long.'
    if not any(c.isupper() for c in password):
        return 'Password must contain at least one uppercase letter.'
    if not any(c.isdigit() for c in password):
        return 'Password must contain at least one number.'
    if not any(c in SPECIAL_CHARS for c in password):
        return 'Password must contain at least one special character (e.g. ! @ # $ %).'
    return None


STATUS_LABELS = {
    'uploaded': 'Uploaded',
    'payment_pending': 'Payment Submitted',
    'processing': 'Processing',
    'doctor_pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
}

MEDICINE_MAP = {
    'Acne': 'Benzoyl Peroxide 2.5% Gel — apply once daily on affected area',
    'Eczema': 'Hydrocortisone Cream 1% — apply twice daily, avoid direct sunlight',
    'Melasma': 'Hydroquinone 4% Cream — apply at night, use sunscreen during day',
    'Rosacea': 'Metronidazole 0.75% Gel — apply twice daily',
    'Shingles': 'Consult doctor for antiviral prescription; Calamine lotion for topical relief',
}


def serialize_user(user, request=None):
    data = {
        'id': str(user['_id']),
        'full_name': user.get('full_name'),
        'email': user.get('email'),
        'age': user.get('age'),
        'role': user.get('role'),
        'specialty': user.get('specialty'),
        'phone': user.get('phone'),
        'hospital': user.get('hospital'),
        'experience_years': user.get('experience_years'),
        'is_doctor_approved': user.get('is_doctor_approved', False),
        'profile_photo': None,
    }
    photo_id = user.get('profile_photo_file_id')
    if photo_id and request is not None:
        data['profile_photo'] = request.build_absolute_uri(f'/media/image/{photo_id}/')
    return data


def serialize_case(case, request, include_patient=True):
    data = {
        'id': str(case['_id']),
        'case_number': case.get('case_number'),
        'status': case.get('status'),
        'status_label': STATUS_LABELS.get(case.get('status'), case.get('status')),
        'created_at': case.get('created_at').isoformat() if case.get('created_at') else None,
        'disease_detected': case.get('disease_detected'),
        'confidence': case.get('confidence'),
        'suggested_medicine': case.get('suggested_medicine'),
        'doctor_note': case.get('doctor_note'),
    }
    image_id = case.get('image_file_id')
    if image_id:
        data['image'] = request.build_absolute_uri(f'/media/image/{image_id}/')
        data['result_image'] = data['image']

    payment = case.get('payment')
    if payment:
        data['payment'] = {
            'unique_id': payment.get('unique_id'),
            'transaction_id': payment.get('transaction_id'),
            'method': payment.get('method'),
            'status': payment.get('status', 'Pending Verification'),
            'submitted_at': payment.get('submitted_at').isoformat() if payment.get('submitted_at') else None,
        }
        screenshot_id = payment.get('screenshot_file_id')
        if screenshot_id:
            data['payment']['screenshot'] = request.build_absolute_uri(f'/media/image/{screenshot_id}/')
    else:
        data['payment'] = None

    if include_patient:
        patient = db.users.find_one({'_id': case.get('patient_id')})
        data['patient'] = {'full_name': patient.get('full_name'), 'email': patient.get('email')} if patient else None
    return data