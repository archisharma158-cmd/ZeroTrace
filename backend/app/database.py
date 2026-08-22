import time
import logging
from typing import Any
import bson
from pymongo import AsyncMongoClient
from app.config import MONGODB_URI, DATABASE_NAME

logger = logging.getLogger(__name__)

# Configure fail-fast timeouts (1.5s server selection instead of default 30s)
client = AsyncMongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=1500,
    connectTimeoutMS=1500,
    socketTimeoutMS=2500,
)
db = client[DATABASE_NAME]

# Circuit breaker state for resilient and fast fallback
_mongo_available = True
_mongo_last_failure = 0.0
_COOLDOWN_SECONDS = 30.0


def _should_try_mongo() -> bool:
    """Check if MongoDB should be queried or if circuit breaker is open."""
    global _mongo_available, _mongo_last_failure
    if _mongo_available:
        return True
    # If cooldown passed, allow one probe attempt to check recovery
    if time.time() - _mongo_last_failure > _COOLDOWN_SECONDS:
        return True
    return False


def _record_mongo_failure(exc: Exception, operation: str, collection_name: str):
    """Trip the circuit breaker on connection failure."""
    global _mongo_available, _mongo_last_failure
    was_available = _mongo_available
    _mongo_available = False
    _mongo_last_failure = time.time()
    if was_available:
        logger.warning(
            "MongoDB unavailable during '%s' on '%s' (%s). Fast in-memory fallback active for %ds cooldown.",
            operation,
            collection_name,
            type(exc).__name__,
            int(_COOLDOWN_SECONDS),
        )


def _record_mongo_success():
    """Reset the circuit breaker when a query succeeds."""
    global _mongo_available
    _mongo_available = True


class InMemoryCollectionFallback:
    def __init__(self, name: str, real_collection: Any):
        self._name = name
        self._real = real_collection
        self._store = {}

    async def find_one(self, filter_dict):
        if _should_try_mongo():
            try:
                result = await self._real.find_one(filter_dict)
                _record_mongo_success()
                return result
            except Exception as e:
                _record_mongo_failure(e, "find_one", self._name)

        # In-memory lookup
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
        if _should_try_mongo():
            try:
                result = await self._real.insert_one(doc)
                _record_mongo_success()
                return result
            except Exception as e:
                _record_mongo_failure(e, "insert_one", self._name)

        # In-memory insert
        if "_id" not in doc:
            doc["_id"] = bson.ObjectId()
        oid = doc["_id"]
        self._store[str(oid)] = doc

        class InsertOneResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        return InsertOneResult(oid)

    async def update_one(self, filter_dict, update_dict, upsert=False):
        if _should_try_mongo():
            try:
                result = await self._real.update_one(filter_dict, update_dict, upsert=upsert)
                _record_mongo_success()
                return result
            except Exception as e:
                _record_mongo_failure(e, "update_one", self._name)

        # In-memory update
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

    async def delete_one(self, filter_dict):
        if _should_try_mongo():
            try:
                result = await self._real.delete_one(filter_dict)
                _record_mongo_success()
                return result
            except Exception as e:
                _record_mongo_failure(e, "delete_one", self._name)

        # In-memory delete
        doc = await self.find_one(filter_dict)
        if doc and "_id" in doc:
            self._store.pop(str(doc["_id"]), None)

    async def delete_many(self, filter_dict):
        if _should_try_mongo():
            try:
                result = await self._real.delete_many(filter_dict)
                _record_mongo_success()
                return result
            except Exception as e:
                _record_mongo_failure(e, "delete_many", self._name)

        # In-memory delete_many
        to_del = []
        for doc_id, doc in self._store.items():
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                to_del.append(doc_id)
        for doc_id in to_del:
            self._store.pop(doc_id, None)


tasks_collection = InMemoryCollectionFallback("tasks", db["tasks"])
traces_collection = InMemoryCollectionFallback("traces", db["traces"])
evaluations_collection = InMemoryCollectionFallback("evaluations", db["evaluations"])
scenarios_collection = InMemoryCollectionFallback("scenarios", db["scenarios"])
full_evaluations_collection = InMemoryCollectionFallback("full_evaluations", db["full_evaluations"])
otps_collection = InMemoryCollectionFallback("otps", db["otps"])


async def ping_db() -> bool:
    """Return True if MongoDB is reachable, False otherwise."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return True
