"""
setup_database.py
------------------
Sets up MongoDB collections to match your ACTUAL backend code
(api/views.py) — not a guessed structure. Matches:
  - a single 'users' collection for both patients and doctors (role field)
  - 'cases' with payment EMBEDDED inside each case document
  - 'password_resets' for OTP-based password reset
  - GridFS (fs.files/fs.chunks) for images — created automatically,
    nothing to do here

Run once with:
    python setup_database.py

Requires:
    pip install pymongo python-dotenv
"""

from pymongo.errors import CollectionInvalid
from mongodb import db


def create_validated_collection(name, validator):
    try:
        db.create_collection(name, validator={"$jsonSchema": validator})
        print(f"[OK] Created collection: {name}")
    except CollectionInvalid:
        db.command({"collMod": name, "validator": {"$jsonSchema": validator}})
        print(f"[OK] Updated validator for existing collection: {name}")


# ---------------------------------------------------------------
# users — patients AND doctors, distinguished by 'role'
# ---------------------------------------------------------------
users_schema = {
    "bsonType": "object",
    "required": ["full_name", "email", "password", "role"],
    "properties": {
        "full_name": {"bsonType": "string"},
        "email": {"bsonType": "string"},
        "password": {"bsonType": "string"},  # hashed, matches your views.py field name
        "role": {"enum": ["patient", "doctor"]},
        "age": {"bsonType": ["int", "null"]},
        "specialty": {"bsonType": ["string", "null"]},
        "phone": {"bsonType": ["string", "null"]},
        "hospital": {"bsonType": ["string", "null"]},
        "experience_years": {"bsonType": ["int", "null"]},
        "is_doctor_approved": {"bsonType": ["bool", "null"]},
        "is_active": {"bsonType": ["bool", "null"]},
        "verification_doc_file_id": {"bsonType": ["string", "null"]},
        "created_at": {"bsonType": "date"},
    }
}

# ---------------------------------------------------------------
# cases — payment is EMBEDDED, not a separate collection
# ---------------------------------------------------------------
cases_schema = {
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
                "screenshot_file_id": {"bsonType": "string"},
                "submitted_at": {"bsonType": "date"},
            }
        },
        "created_at": {"bsonType": "date"},
    }
}

# ---------------------------------------------------------------
# password_resets — OTP flow
# ---------------------------------------------------------------
password_resets_schema = {
    "bsonType": "object",
    "required": ["email", "role", "code", "expires_at"],
    "properties": {
        "email": {"bsonType": "string"},
        "role": {"bsonType": "string"},
        "code": {"bsonType": "string"},
        "expires_at": {"bsonType": "date"},
        "created_at": {"bsonType": "date"},
    }
}

# ---------------------------------------------------------------
# diseases — optional reference data, not used by your code yet
# ---------------------------------------------------------------
diseases_schema = {
    "bsonType": "object",
    "required": ["name"],
    "properties": {
        "name": {"bsonType": "string"},
        "description": {"bsonType": "string"},
        "symptoms": {"bsonType": "array", "items": {"bsonType": "string"}},
        "active": {"bsonType": "bool"},
    }
}


def setup_collections():
    create_validated_collection("users", users_schema)
    create_validated_collection("cases", cases_schema)
    create_validated_collection("password_resets", password_resets_schema)
    create_validated_collection("diseases", diseases_schema)
    # fs.files / fs.chunks are created automatically by GridFS on first upload


def setup_indexes():
    db.users.create_index("email", unique=True)
    db.cases.create_index("patient_id")
    db.cases.create_index("status")
    db.password_resets.create_index([("email", 1), ("role", 1)])
    # TTL index: MongoDB auto-deletes expired reset codes
    db.password_resets.create_index("expires_at", expireAfterSeconds=0)
    print("[OK] Indexes created")


if __name__ == "__main__":
    setup_collections()
    setup_indexes()
    print("\nDatabase setup complete — matches your real backend schema.")
