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

    db[COLLECTION_NAME].create_index("expires_at", expireAfterSeconds=0)
