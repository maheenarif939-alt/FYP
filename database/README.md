# DermaCareMe — Database Folder Structure

Har collection **poori tarah self-contained** ek hi file mein hai — uska schema, uske indexes, AUR agar usay seed/add karne wala koi script chahiye, wo bhi usi file ke andar. Bilkul jaise frontend mein har page ki apni complete file hoti hai.

```
database/
├── mongodb.py                     ← MongoDB connection (.env se)
├── setup_database.py              ← Sab collections + indexes banata hai (har file se import karke)
├── test_connection.py             ← Connection check karne ke liye
├── database_schema.md             ← Poora schema documentation (fields, types, notes)
├── requirements.txt
├── .env.example
├── .gitignore
│
└── db_collections/                 ← Har collection ki apni, complete file
    ├── __init__.py
    ├── users.py                   ← patients + doctors (role field se)
    ├── cases.py                   ← scans/cases, payment EMBEDDED isi ke andar
    ├── admins.py                  ← schema + real admin add/update karne ka code, dono isi mein
    ├── email_verifications.py     ← signup OTP
    ├── password_resets.py         ← forgot-password OTP
    ├── diseases.py                ← schema + sample data seed karne ka code, dono isi mein
    └── images_gridfs.py           ← GridFS images (schema nahi, sirf helper functions)
```

## Ek collection file ke andar kya hota hai:

Har file mein hamesha ye 3 cheezein hoti hain:
```python
COLLECTION_NAME = "users"        # collection ka naam
SCHEMA = { ... }                  # $jsonSchema validation rules
def create_indexes(db): ...       # is collection ke indexes
```

Kuch files (`admins.py`, `diseases.py`) mein **extra** bhi hota hai — unka apna seed/add logic, jo **usi file ke andar** rehta hai, kisi alag top-level script mein nahi:

- **`admins.py`** — upar `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` edit karke, isi file ko standalone chalayein:
  ```bash
  python -m db_collections.admins
  ```
- **`diseases.py`** — sample diseases (Acne, Eczema, wagera) collection mein daalne ke liye:
  ```bash
  python -m db_collections.diseases
  ```
  (dono commands `database/` folder ke andar se chalayein)

**`images_gridfs.py`** thoda alag hai — GridFS ka apna schema nahi hota (MongoDB khud manage karta hai), isliye is file mein `SCHEMA` nahi hai, sirf `upload_image()`, `download_image()`, `delete_image()` helper functions hain jo backend ke `views.py` jaisa hi kaam karte hain. Test karne ke liye:
```bash
python -m db_collections.images_gridfs
```
Ye ek test image upload → download → delete kar ke confirm karta hai GridFS sahi kaam kar raha hai.

## Naya collection future mein add karna ho to:

1. `db_collections/` mein ek nayi file banayein (jaise `notifications.py`), usi pattern se (`COLLECTION_NAME`, `SCHEMA`, `create_indexes`, aur zaroorat ho to seed function bhi usi file mein)
2. `setup_database.py` ke upar import line mein aur `COLLECTION_MODULES` list mein usay add kar dein

## Poora setup chalane ka tareeka:

```bash
cd database
pip install -r requirements.txt
python setup_database.py             # sab collections + indexes banata hai
python -m db_collections.admins       # apna real admin add karta hai
python -m db_collections.diseases     # (optional) sample diseases add karta hai
python test_connection.py             # confirm karta hai sab connected hai
```

Poora schema (fields, types, kaunsi collection kis liye hai) `database_schema.md` mein hai.
