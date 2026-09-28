"""
password_resets.py
-------------------
The 'password_resets' collection: OTP codes for the "forgot password"
flow. Separate from email_verifications, which handles signup
verification instead. Expired codes are auto-deleted via TTL index.
"""

COLLECTION_NAME = "password_resets"

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
