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
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Security
SECRET_KEY: str = os.getenv("SECRET_KEY", "zerotrace-secret-key-for-hmac-otp-2026")

# Email / SMTP
SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL: str = os.getenv("SMTP_EMAIL", "")
SMTP_APP_PASSWORD: str = os.getenv("SMTP_APP_PASSWORD", "")
CONTACT_RECEIVER_EMAIL: str = os.getenv("CONTACT_RECEIVER_EMAIL", "") or SMTP_EMAIL

# OTP Settings
OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))