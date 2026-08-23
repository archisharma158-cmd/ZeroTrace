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
    """Safely prewarm metadata in background and log startup diagnostics."""
    logger.info(f"CORS allowed origins: {allowed_origins}")
    logger.info(f"CORS allowed origin regex: {ALLOWED_ORIGIN_REGEX}")
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
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://zero-trace-nine.vercel.app",
]

# Parse FRONTEND_URL (handles comma-separated list or single URL, strips trailing slashes)
_env_origins = [
    origin.strip().rstrip("/")
    for origin in FRONTEND_URL.split(",")
    if origin.strip()
] if FRONTEND_URL else []

allowed_origins = list(dict.fromkeys(_default_origins + _env_origins))

# Allow all Vercel preview/production deployments
ALLOWED_ORIGIN_REGEX = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
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
