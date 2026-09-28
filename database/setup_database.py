from pymongo.errors import CollectionInvalid
from mongodb import db

from db_collections import (
    users, cases, admins, email_verifications, password_resets, diseases, images_gridfs,
)

# Collections schema

COLLECTION_MODULES = [
    users,
    cases,
    admins,
    email_verifications,
    password_resets,
    diseases,
]

INDEX_ONLY_MODULES = [
    images_gridfs,
]


def create_validated_collection(name, validator):
    try:
        db.create_collection(name, validator={"$jsonSchema": validator})
        print(f"[OK] Created collection: {name}")
    except CollectionInvalid:
        db.command({"collMod": name, "validator": {"$jsonSchema": validator}})
        print(f"[OK] Updated validator for existing collection: {name}")


def setup_collections():
    for module in COLLECTION_MODULES:
        create_validated_collection(module.COLLECTION_NAME, module.SCHEMA)
 
    print("[OK] fs.files / fs.chunks (GridFS) will appear automatically on first image upload")


def setup_indexes():
    for module in COLLECTION_MODULES + INDEX_ONLY_MODULES:
        module.create_indexes(db)
    print("[OK] Indexes created")


if __name__ == "__main__":
    setup_collections()
    setup_indexes()
    print("\nDatabase setup complete — one file per collection, matches your real backend schema.")
