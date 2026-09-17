from bson import ObjectId
from gridfs import GridFS

from .mongodb import db
from .inference import predict_disease
from .utils import MEDICINE_MAP

CONSULTATION_FEE = 500


def try_advance_case(case_id):
    """
    Moves a case into the doctor's queue only once BOTH admin gates are
    cleared: the scan image is marked 'Clear' AND the payment is
    'Approved'. Whichever action happens second (image or payment)
    triggers the AI model and pushes the case to 'doctor_pending'.
    """
    case = db.cases.find_one({'_id': case_id})
    if not case:
        return None

    payment = case.get('payment') or {}
    already_done = case.get('status') in ('doctor_pending', 'approved', 'rejected')

    if not already_done and payment.get('status') == 'Approved' and case.get('image_status') == 'Clear':
        fs = GridFS(db)
        disease, confidence = None, 0.0
        try:
            image_bytes = fs.get(ObjectId(case['image_file_id'])).read()
            print(f"[AI] Loaded image, size in bytes: {len(image_bytes)}")
            disease, confidence = predict_disease(image_bytes)
        except Exception:
            import traceback
            print("=== AI PREDICTION ERROR ===")
            traceback.print_exc()

        update = {
            'status': 'doctor_pending',
            'disease_detected': disease or 'Pending Diagnosis',
            'confidence': confidence,
            'suggested_medicine': MEDICINE_MAP.get(disease, 'Doctor consultation required — condition not clearly identified by AI.'),
        }
        db.cases.update_one({'_id': case['_id']}, {'$set': update})
        case.update(update)

    return case