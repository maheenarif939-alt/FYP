"""
test_connection.py
-------------------
Quick check that the MongoDB connection works and lists collections.

Run:
    python test_connection.py
"""

from mongodb import db

try:
    print("Connected to database:", db.name)
    print("Collections found:", db.list_collection_names())
except Exception as e:
    print("Connection failed:", e)
