from pymongo import AsyncMongoClient
from app.config import MONGODB_URI, DATABASE_NAME

client = AsyncMongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

tasks_collection = db["tasks"]
traces_collection = db["traces"]
evaluations_collection = db["evaluations"]


async def ping_db() -> bool:
    """Return True if MongoDB is reachable, False otherwise."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False

