"""
users.py
--------
The 'users' collection: BOTH patients and doctors live here,
distinguished by the 'role' field. Matches api/views.py exactly
(signup, doctor_signup, login).
"""

COLLECTION_NAME = "users"

SCHEMA = {
    "bsonType": "object",
    "required": ["full_name", "email", "password", "role"],
    "properties": {
        "full_name": {"bsonType": "string"},
        "email": {"bsonType": "string"},
        "password": {"bsonType": "string"},  # hashed (Django's PBKDF2 hasher)
        "role": {"enum": ["patient", "doctor"]},
        "age": {"bsonType": ["int", "null"]},                       # patient
        "email_verified": {"bsonType": ["bool", "null"]},           # both
        "specialty": {"bsonType": ["string", "null"]},              # doctor
        "phone": {"bsonType": ["string", "null"]},                  # doctor
        "hospital": {"bsonType": ["string", "null"]},                # doctor
        "experience_years": {"bsonType": ["int", "null"]},           # doctor
        "is_doctor_approved": {"bsonType": ["bool", "null"]},        # doctor
        "is_active": {"bsonType": ["bool", "null"]},                 # doctor
        "verification_doc_file_id": {"bsonType": ["string", "null"]},  # doctor, GridFS ref
        "created_at": {"bsonType": "date"},
    }
}


def create_indexes(db):
    db[COLLECTION_NAME].create_index("email", unique=True)
