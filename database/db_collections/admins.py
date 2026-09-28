"""
admins.py
---------
The 'admins' collection: separate login for the admin panel, with
its own bcrypt-hashed password (independent of the users collection's
Django-hasher-based passwords).

This file is self-contained: schema, indexes, AND the script to add
or update the real admin account all live here.

HOW TO ADD YOUR REAL ADMIN:
1. Edit ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD below.
2. Run this file directly:
       python -m db_collections.admins
3. Safe to run again later — it updates the password if the email
   already exists, instead of creating a duplicate.

Requires:
    pip install bcrypt
"""

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

# ---------------------------------------------------------------
# EDIT THESE with the real admin's details before running this file
# ---------------------------------------------------------------
ADMIN_NAME = "Eman"                          # <-- change
ADMIN_EMAIL = "eman@dermacareme.com"         # <-- change
ADMIN_PASSWORD = "PutARealPasswordHere123!"  # <-- change


def create_indexes(db):
    db[COLLECTION_NAME].create_index("email", unique=True)


def _hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def add_or_update_admin(db):
    """Adds ADMIN_EMAIL as an admin, or updates its name/password if it already exists."""
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
    # Run with: python -m db_collections.admins  (from the database/ folder)
    from mongodb import db
    add_or_update_admin(db)

