"""
mongodb.py
----------
Central MongoDB connection — matches what your backend's api/mongodb.py
already does. Kept here too so the setup/seed scripts in this folder
can run independently.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "Dermacareme")  # exact case must match Atlas

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
