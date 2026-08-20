from datetime import timedelta
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv


# ============================================================
# BASE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

# Load local .env file.
# Render environment variables should NOT be overridden.
load_dotenv(
    BASE_DIR / ".env",
    override=False,
)


# ============================================================
# ENV HELPERS
# ============================================================

def get_env_list(name, default=""):
    """
    Read a comma-separated environment variable and
    return a clean Python list.

    Supports:
    - string
    - tuple
    - list
    """

    value = os.environ.get(name)

    if value is None:
        value = default

    if isinstance(value, (list, tuple)):
        return [
            str(item).strip().rstrip("/")
            for item in value
            if str(item).strip()
        ]

    return [
        item.strip().rstrip("/")
        for item in str(value).split(",")
        if item.strip()
    ]


# ============================================================
# FAST2SMS
# ============================================================

FAST2SMS_API_KEY = os.environ.get(
    "FAST2SMS_API_KEY",
    "",
)


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-local-development-key",
)

DEBUG = (
    os.environ.get(
        "DEBUG",
        "False",
    )
    .strip()
    .lower()
    == "true"
)


ALLOWED_HOSTS = get_env_list(
    "DJANGO_ALLOWED_HOSTS",
    (
        "127.0.0.1",
        "localhost",
        "foodkindlapp-nscw.onrender.com",
        ".onrender.com",
    ),
)


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",

    "accounts",
    "community",
    "website",
    "safety",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URLS / WSGI
# ============================================================

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends.django."
            "DjangoTemplates"
        ),

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                (
                    "django.template."
                    "context_processors.request"
                ),

                (
                    "django.contrib.auth."
                    "context_processors.auth"
                ),

                (
                    "django.contrib.messages."
                    "context_processors.messages"
                ),
            ],
        },
    },
]


# ============================================================
# DATABASE
#
# Production / Render:
# PostgreSQL through DATABASE_URL
#
# Local development:
# SQLite fallback
# ============================================================

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "",
).strip()


if DATABASE_URL:

    # ========================================================
    # RENDER / PRODUCTION - POSTGRESQL
    # ========================================================

    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=not DEBUG,
        )
    }

else:

    # ========================================================
    # LOCAL DEVELOPMENT - SQLITE
    # ========================================================

    DATABASES = {
        "default": {
            "ENGINE":
                "django.db.backends.sqlite3",

            "NAME":
                BASE_DIR / "db.sqlite3",
        }
    }


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ============================================================
# LANGUAGE / TIME
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


STORAGES = {
    "default": {
        "BACKEND": (
            "django.core.files.storage."
            "FileSystemStorage"
        ),
    },

    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage."
            "CompressedManifestStaticFilesStorage"
        ),
    },
}


# ============================================================
# MEDIA
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# CORS
# ============================================================

CORS_ALLOWED_ORIGINS = get_env_list(
    "CORS_ALLOWED_ORIGINS",
    (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8888",
        "http://127.0.0.1:8888",
        "https://foodkindlapp.netlify.app",
        "https://foodkindl.org",
        "https://www.foodkindl.org",
    ),
)

CORS_ALLOW_CREDENTIALS = True


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = get_env_list(
    "CSRF_TRUSTED_ORIGINS",
    (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8888",
        "http://127.0.0.1:8888",
        "https://foodkindlapp.netlify.app",
        "https://foodkindlapp-nscw.onrender.com",
        "https://foodkindl.org",
        "https://www.foodkindl.org",
    ),
)


# ============================================================
# REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        (
            "rest_framework_simplejwt."
            "authentication.JWTAuthentication"
        ),
    ),

    "DEFAULT_PERMISSION_CLASSES": (
        (
            "rest_framework.permissions."
            "IsAuthenticatedOrReadOnly"
        ),
    ),

    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination."
        "PageNumberPagination"
    ),

    "PAGE_SIZE": 12,
}


# ============================================================
# JWT
# ============================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":
        timedelta(hours=4),

    "REFRESH_TOKEN_LIFETIME":
        timedelta(days=14),

    "ROTATE_REFRESH_TOKENS":
        True,

    "BLACKLIST_AFTER_ROTATION":
        False,
}


# ============================================================
# HTTPS / SECURITY
# ============================================================

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"


# ============================================================
# LOCAL DEVELOPMENT
# ============================================================

if DEBUG:

    SECURE_SSL_REDIRECT = False

    SESSION_COOKIE_SECURE = False

    CSRF_COOKIE_SECURE = False

    SECURE_HSTS_SECONDS = 0

    SECURE_HSTS_INCLUDE_SUBDOMAINS = False

    SECURE_HSTS_PRELOAD = False


# ============================================================
# PRODUCTION / RENDER
# ============================================================

else:

    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True

    SECURE_HSTS_SECONDS = 31536000

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


# ============================================================
# LOGGING
# ============================================================

LOGGING = {
    "version": 1,

    "disable_existing_loggers":
        False,

    "formatters": {
        "verbose": {
            "format": (
                "{levelname} "
                "{asctime} "
                "{name} "
                "{module} "
                "{message}"
            ),

            "style": "{",
        },
    },

    "handlers": {
        "console": {
            "class":
                "logging.StreamHandler",

            "formatter":
                "verbose",
        },
    },

    "loggers": {
        "django": {
            "handlers": [
                "console"
            ],

            "level":
                "INFO",

            "propagate":
                False,
        },

        "django.request": {
            "handlers": [
                "console"
            ],

            "level":
                "ERROR",

            "propagate":
                False,
        },
    },

    "root": {
        "handlers": [
            "console"
        ],

        "level":
            "INFO",
    },
}


# ============================================================
# DEBUG CHECK
# ============================================================

if DEBUG:

    print(
        "======================================"
    )

    print(
        "FOODKINDL LOCAL DEVELOPMENT"
    )

    print(
        "DEBUG:",
        DEBUG,
    )

    print(
        "DATABASE:",
        (
            "PostgreSQL"
            if DATABASE_URL
            else "SQLite"
        ),
    )

    print(
        "SECURE_SSL_REDIRECT:",
        SECURE_SSL_REDIRECT,
    )

    print(
        "ALLOWED_HOSTS:",
        ALLOWED_HOSTS,
    )

    print(
        "CORS_ALLOWED_ORIGINS:",
        CORS_ALLOWED_ORIGINS,
    )

    print(
        "CSRF_TRUSTED_ORIGINS:",
        CSRF_TRUSTED_ORIGINS,
    )

    print(
        "======================================"
    )