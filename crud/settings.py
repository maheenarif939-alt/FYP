import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-CHANGE-ME-before-deploy')

DEBUG = True

ALLOWED_HOSTS = ['*']  # Dev ke liye theek hai; production mein specific IP/domain likhna

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True  # Dev only — app kisi bhi IP se hit kar sake

ROOT_URLCONF = 'crud.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {'context_processors': ['django.template.context_processors.request']},
    },
]

WSGI_APPLICATION = 'crud.wsgi.application'

# Django ko boot hone ke liye ek DATABASES chahiye hota hai, lekin hum
# asal data MongoDB mein raw PyMongo collections ke through rakh rahe
# hain (api/mongodb.py) — isliye yahan sirf ek halka sqlite hai jo
# kabhi use hi nahi hoga.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# ---------------------------------------------------------------------
# Admin Panel (web) ke liye — login credentials aur consultation fee
# ---------------------------------------------------------------------
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'eman@dermacareme.com')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Eman143@')
CONSULTATION_FEE = 500

# ---------------------------------------------------------------------------
# Email (Forgot Password ke liye) — Gmail SMTP, credentials .env se aate hain
# ---------------------------------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER