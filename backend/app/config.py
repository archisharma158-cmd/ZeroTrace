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
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# NVIDIA NIM - adversarial scenario generation
NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "")

# Mistral - secondary evaluator / fallback
MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "")

# Frontend
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173").strip().rstrip("/")

# Security
SECRET_KEY: str = os.getenv("SECRET_KEY", "zerotrace-secret-key-for-hmac-otp-2026")

# Email Delivery — Brevo Transactional Email HTTP API (HTTPS POST to api.brevo.com/v3/smtp/email)
BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "").strip()
BREVO_SENDER_EMAIL: str = os.getenv("BREVO_SENDER_EMAIL", "").strip()
BREVO_SENDER_NAME: str = os.getenv("BREVO_SENDER_NAME", "ZeroTrace").strip()
CONTACT_RECEIVER_EMAIL: str = os.getenv("CONTACT_RECEIVER_EMAIL", "").strip()

# OTP Settings
OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))