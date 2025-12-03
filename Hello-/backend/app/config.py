"""Application configuration."""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Earth Engine settings
EE_PROJECT_ID = os.environ.get("EE_PROJECT_ID", "vibrant-arcanum-477610-v0")
EE_SERVICE_ACCOUNT = os.environ.get("EE_SERVICE_ACCOUNT")
EE_PRIVATE_KEY = os.environ.get("EE_PRIVATE_KEY")

# Supabase settings
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Firebase/Firestore settings
FIREBASE_SERVICE_ACCOUNT_PATH = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "erthaloka-5853f")

# Sensor data cache settings (in seconds)
SENSOR_CACHE_TTL = int(os.environ.get("SENSOR_CACHE_TTL", 1800))  # 30 minutes default

# External API settings
OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY")
EXTERNAL_API_CACHE_TTL = int(os.environ.get("EXTERNAL_API_CACHE_TTL", 300))  # 5 minutes default

# PDF settings
PDF_OUTPUT_DIR = BASE_DIR / "temp_pdfs"
PDF_OUTPUT_DIR.mkdir(exist_ok=True)

# Supabase Storage bucket for PDFs
SUPABASE_STORAGE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "phi-reports")

# API settings
API_VERSION = "1.0.0"
