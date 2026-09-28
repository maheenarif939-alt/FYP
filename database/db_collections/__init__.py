"""
collections package
--------------------
Each file here defines ONE MongoDB collection: its name, its
validation schema, and its indexes — kept separate so each collection
is easy to find and edit on its own, just like separate page files
in a frontend project.

Every module exposes the same three things, used by setup_database.py:
    COLLECTION_NAME : str
    SCHEMA          : dict   (the $jsonSchema validator)
    create_indexes(db)      : function that sets up this collection's indexes
"""
