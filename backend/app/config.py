import os
from dotenv import load_dotenv

load_dotenv()

# Database
MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "zerotrace")

# Groq - Trasey primary execution engine
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Gemini - independent evaluator
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# NVIDIA NIM - adversarial scenario generation
NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "")

# Mistral - secondary evaluator / fallback
MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "")

# Frontend
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")