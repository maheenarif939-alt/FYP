import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    tlsDisableOCSPEndpointCheck=True,
    serverSelectionTimeoutMS=30000
)

try:
    client.admin.command("ping")

    db = client[MONGO_DB]

    print("MongoDB Connected Successfully!")
    print("Database:", db.name)
    print("Collections:")
    print(db.list_collection_names())

except Exception as e:
    print("MongoDB Connection Failed!")
    print(e)

finally:
    client.close()