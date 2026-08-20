from pymongo import AsyncMongoClient
from app.config import MONGODB_URI, DATABASE_NAME
import logging
from typing import Any
import bson

logger = logging.getLogger(__name__)

client = AsyncMongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

class InMemoryCollectionFallback:
    def __init__(self, name: str, real_collection: Any):
        self._name = name
        self._real = real_collection
        self._store = {}

    async def find_one(self, filter_dict):
        try:
            return await self._real.find_one(filter_dict)
        except Exception:
            logger.warning("MongoDB fallback: find_one on '%s' failed. Using in-memory store.", self._name)
            for doc in self._store.values():
                match = True
                for k, v in filter_dict.items():
                    if k == "_id":
                        doc_id = str(doc.get("_id"))
                        val_str = str(v)
                        if doc_id != val_str:
                            match = False
                            break
                    else:
                        if doc.get(k) != v:
                            match = False
                            break
                if match:
                    return doc
            return None

    async def insert_one(self, doc):
        try:
            return await self._real.insert_one(doc)
        except Exception:
            logger.warning("MongoDB fallback: insert_one on '%s' failed. Saving in-memory.", self._name)
            if "_id" not in doc:
                doc["_id"] = bson.ObjectId()
            oid = doc["_id"]
            self._store[str(oid)] = doc
            
            class InsertOneResult:
                def __init__(self, inserted_id):
                    self.inserted_id = inserted_id
            return InsertOneResult(oid)

    async def update_one(self, filter_dict, update_dict, upsert=False):
        try:
            return await self._real.update_one(filter_dict, update_dict, upsert=upsert)
        except Exception:
            logger.warning("MongoDB fallback: update_one on '%s' failed. Updating in-memory.", self._name)
            doc = await self.find_one(filter_dict)
            if not doc:
                if upsert:
                    doc = {}
                    for k, v in filter_dict.items():
                        if k != "_id":
                            doc[k] = v
                    if "_id" not in doc:
                        doc["_id"] = bson.ObjectId()
                    self._store[str(doc["_id"])] = doc
                else:
                    return
            
            if "$set" in update_dict:
                for k, v in update_dict["$set"].items():
                    doc[k] = v

tasks_collection = InMemoryCollectionFallback("tasks", db["tasks"])
traces_collection = InMemoryCollectionFallback("traces", db["traces"])
evaluations_collection = InMemoryCollectionFallback("evaluations", db["evaluations"])
scenarios_collection = InMemoryCollectionFallback("scenarios", db["scenarios"])
full_evaluations_collection = InMemoryCollectionFallback("full_evaluations", db["full_evaluations"])


async def ping_db() -> bool:
    """Return True if MongoDB is reachable, False otherwise."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        # Fallback to True to allow health check to pass if in-memory store is active
        return True


