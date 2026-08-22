"""
ZeroTrace — AI Agent Evaluation and Reliability Engine.

Main FastAPI application entry point.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import FRONTEND_URL
from app.database import ping_db
from app.routes import tasks, traces, evaluation, scenarios, contact, auth
from app.services.evaluator import prewarm_gemini_models
from app.services.mistral_evaluator import prewarm_mistral_models

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Safely prewarm metadata in background without blocking startup."""
    # Spawn background prewarm tasks
    asyncio.create_task(prewarm_gemini_models())
    asyncio.create_task(prewarm_mistral_models())
    yield


app = FastAPI(
    title="ZeroTrace",
    description="AI Agent Evaluation and Reliability Engine — powered by Trasey.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
_allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
if FRONTEND_URL and FRONTEND_URL not in _allowed_origins:
    _allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(tasks.router)
app.include_router(traces.router)
app.include_router(evaluation.router)
app.include_router(scenarios.router)
app.include_router(contact.router)
app.include_router(auth.router)


# ── Root & Health ─────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "ZeroTrace",
        "agent": "Trasey",
        "status": "online",
    }


@app.get("/health", tags=["Health"])
async def health():
    db_ok = await ping_db()
    status_code = 200 if db_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if db_ok else "unhealthy",
            "database": "connected" if db_ok else "disconnected",
        },
    )
