"""
setup_database.py
------------------
Creates every collection and its indexes by pulling the definition
from its own file under db_collections/ (users.py, cases.py, admins.py,
email_verifications.py, password_resets.py, diseases.py).

images_gridfs.py is handled slightly differently: GridFS manages its
own two collections (fs.files / fs.chunks) automatically, so there is
no schema to create for it — only its create_indexes() is called
(which is a no-op, since GridFS already indexes itself).

To add a new collection in the future: create a new file in
db_collections/ following the same pattern (COLLECTION_NAME, SCHEMA,
create_indexes), then add it to the COLLECTION_MODULES list below.

Run once with:
    python setup_database.py

Requires:
    pip install pymongo python-dotenv
"""

from pymongo.errors import CollectionInvalid
from mongodb import db

from db_collections import (
    users, cases, admins, email_verifications, password_resets, diseases, images_gridfs,
)

# Collections with a real schema to validate
COLLECTION_MODULES = [
    users,
    cases,
    admins,
    email_verifications,
    password_resets,
    diseases,
]

# Modules that only need create_indexes() called (no schema to create)
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
    # fs.files / fs.chunks (GridFS, for images) are created automatically
    # the first time an image is uploaded — nothing to create here.
    print("[OK] fs.files / fs.chunks (GridFS) will appear automatically on first image upload")


def setup_indexes():
    for module in COLLECTION_MODULES + INDEX_ONLY_MODULES:
        module.create_indexes(db)
    print("[OK] Indexes created")


if __name__ == "__main__":
    setup_collections()
    setup_indexes()
    print("\nDatabase setup complete — one file per collection, matches your real backend schema.")
