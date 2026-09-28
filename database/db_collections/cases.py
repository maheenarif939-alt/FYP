COLLECTION_NAME = "cases"

SCHEMA = {
    "bsonType": "object",
    "required": ["patient_id", "status"],
    "properties": {
        "patient_id": {"bsonType": "objectId"},          
        "case_number": {"bsonType": ["string", "int"]},
        "image_file_id": {"bsonType": ["string", "null"]},  
        "status": {"enum": ["uploaded", "payment_pending", "doctor_pending", "approved", "rejected"]},
        "image_status": {"bsonType": ["string", "null"]},   
        "disease_detected": {"bsonType": ["string", "null"]},
        "confidence": {"bsonType": ["double", "int", "null"]},
        "suggested_medicine": {"bsonType": ["string", "null"]},
        "doctor_note": {"bsonType": ["string", "null"]},
        "payment": {
            "bsonType": ["object", "null"],
            "properties": {
                "transaction_id": {"bsonType": "string"},
                "method": {"bsonType": "string"},
                "amount": {"bsonType": "int"},
                "status": {"bsonType": "string"},          
                "screenshot_file_id": {"bsonType": "string"},  # GridFS ref
                "submitted_at": {"bsonType": "date"},
            }
        },
        "created_at": {"bsonType": "date"},
    }
}


def create_indexes(db):
    db[COLLECTION_NAME].create_index("patient_id")
    db[COLLECTION_NAME].create_index("status")
