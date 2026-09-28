import datetime
import bcrypt

COLLECTION_NAME = "admins"

SCHEMA = {
    "bsonType": "object",
    "required": ["full_name", "email", "password"],
    "properties": {
        "full_name": {"bsonType": "string"},
        "email": {"bsonType": "string"},
        "password": {"bsonType": "string"},  # bcrypt hash
        "is_active": {"bsonType": ["bool", "null"]},
        "created_at": {"bsonType": "date"},
    }
}

ADMIN_NAME = "Eman"                          
ADMIN_EMAIL = "eman@dermacareme.com"        
ADMIN_PASSWORD = "Eman@143"  


def create_indexes(db):
    db[COLLECTION_NAME].create_index("email", unique=True)


def _hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def add_or_update_admin(db):
    admins = db[COLLECTION_NAME]
    existing = admins.find_one({"email": ADMIN_EMAIL})
    hashed = _hash_password(ADMIN_PASSWORD)

    if existing:
        admins.update_one(
            {"_id": existing["_id"]},
            {"$set": {"full_name": ADMIN_NAME, "password": hashed, "is_active": True}}
        )
        print(f"[OK] Admin updated: {ADMIN_EMAIL}")
    else:
        admins.insert_one({
            "full_name": ADMIN_NAME,
            "email": ADMIN_EMAIL,
            "password": hashed,
            "is_active": True,
            "created_at": datetime.datetime.now(datetime.timezone.utc),
        })
        print(f"[OK] Admin created: {ADMIN_EMAIL}")


if __name__ == "__main__":
    from mongodb import db
    add_or_update_admin(db)

