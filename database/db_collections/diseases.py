"""
diseases.py
-----------
The 'diseases' collection: optional reference data (disease names,
descriptions, symptoms). Not queried anywhere in the current backend
code yet, but kept here in case it's used later for showing extra
info alongside an AI prediction.

This file is self-contained: schema, indexes, AND the sample-data
seed script all live here.

HOW TO SEED SAMPLE DISEASES:
    python -m db_collections.diseases   (from the database/ folder)

Safe to run multiple times — skips diseases that already exist.
"""

COLLECTION_NAME = "diseases"

SCHEMA = {
    "bsonType": "object",
    "required": ["name"],
    "properties": {
        "name": {"bsonType": "string"},
        "description": {"bsonType": "string"},
        "symptoms": {"bsonType": "array", "items": {"bsonType": "string"}},
        "active": {"bsonType": "bool"},
    }
}

SAMPLE_DISEASES = [
    {
        "name": "Acne",
        "description": "A common skin condition that causes pimples and clogged pores.",
        "symptoms": ["Pimples", "Blackheads", "Whiteheads", "Oily skin"],
        "active": True,
    },
    {
        "name": "Eczema",
        "description": "A skin condition that can cause dry, itchy and irritated skin.",
        "symptoms": ["Dryness", "Itching", "Redness", "Cracked skin"],
        "active": True,
    },
    {
        "name": "Melasma",
        "description": "A condition that causes darker patches or uneven pigmentation on the skin.",
        "symptoms": ["Brown patches", "Uneven skin tone", "Facial pigmentation"],
        "active": True,
    },
    {
        "name": "Rosacea",
        "description": "A skin condition that commonly causes persistent facial redness and visible blood vessels.",
        "symptoms": ["Facial redness", "Visible blood vessels", "Bumps", "Sensitive skin"],
        "active": True,
    },
    {
        "name": "Shingles",
        "description": "A viral skin condition that can cause a painful rash, usually affecting one side of the body.",
        "symptoms": ["Painful rash", "Blisters", "Burning sensation", "Fever"],
        "active": True,
    },
]


def create_indexes(db):
    db[COLLECTION_NAME].create_index("name", unique=True)


def seed_sample_diseases(db):
    """Inserts each disease in SAMPLE_DISEASES if it isn't already there."""
    diseases = db[COLLECTION_NAME]
    for disease in SAMPLE_DISEASES:
        if diseases.find_one({"name": disease["name"]}):
            print(f"[SKIP] {disease['name']} already exists")
            continue
        diseases.insert_one(disease)
        print(f"[OK] Added: {disease['name']}")


if __name__ == "__main__":
    # Run with: python -m db_collections.diseases  (from the database/ folder)
    from mongodb import db
    seed_sample_diseases(db)

