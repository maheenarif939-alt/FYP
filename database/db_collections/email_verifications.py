"""
email_verifications.py
-----------------------
The 'email_verifications' collection: OTP codes sent right after
signup, so a patient must verify their email before logging in.
Separate from password_resets, which handles a different flow.
Expired codes are auto-deleted by MongoDB via a TTL index.
"""

COLLECTION_NAME = "email_verifications"

SCHEMA = {
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


def create_indexes(db):
    db[COLLECTION_NAME].create_index([("email", 1), ("role", 1)])
    # TTL index: MongoDB automatically deletes documents once expires_at has passed
    db[COLLECTION_NAME].create_index("expires_at", expireAfterSeconds=0)
