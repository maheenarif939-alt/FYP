```python
COLLECTION_NAME = "users"
SCHEMA = { ... }

def create_indexes(db):
    ...
```

```bash
python -m db_collections.admins
```

```bash
python -m db_collections.diseases
```

```bash
python -m db_collections.images_gridfs
```

```python
# setup_database.py

from db_collections import ...
COLLECTION_MODULES = [
    ...
]
```

```bash
cd database
pip install -r requirements.txt
python setup_database.py
python -m db_collections.admins
python -m db_collections.diseases
python test_connection.py
```

`database_schema.md`
