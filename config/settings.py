import os
from pathlib import Path
from datetime import timedelta


BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'secondlife-django-production-ready-secret-key-2026'
)

DEBUG = os.environ.get(
    'DEBUG',
    'True'
) == 'True'

ALLOWED_HOSTS = ['*']


# ============================================================
# INSTALLED APPS
# ============================================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    # SecondLife Apps
    'accounts.apps.AccountsConfig',
    'organizations.apps.OrganizationsConfig',
    'donations.apps.DonationsConfig',
    'item_requests.apps.ItemRequestsConfig',
    'connections.apps.ConnectionsConfig',
    'notifications.apps.NotificationsConfig',
    'dashboard.apps.DashboardConfig',
    'chatbot.apps.ChatbotConfig',
    'feedback.apps.FeedbackConfig',
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]

try:
    import whitenoise

    MIDDLEWARE.append(
        'whitenoise.middleware.WhiteNoiseMiddleware'
    )

except ImportError:
    pass

MIDDLEWARE.extend([
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
])


# ============================================================
# URL / TEMPLATES / WSGI
# ============================================================

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND':
            'django.template.backends.django.DjangoTemplates',

        'DIRS': [
            BASE_DIR / 'templates'
        ],

        'APP_DIRS': True,

        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# ============================================================
# AUTH USER
# ============================================================

AUTH_USER_MODEL = 'accounts.User'


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    ''
)

if (
    DATABASE_URL.startswith('postgres://')
    or
    DATABASE_URL.startswith('postgresql://')
):

    import urllib.parse

    url = urllib.parse.urlparse(
        DATABASE_URL
    )

    DATABASES = {
        'default': {
            'ENGINE':
                'django.db.backends.postgresql',

            'NAME':
                url.path[1:],

            'USER':
                url.username,

            'PASSWORD':
                url.password,

            'HOST':
                url.hostname,

            'PORT':
                url.port or 5432,
        }
    }

else:

    DATABASES = {
        'default': {
            'ENGINE':
                'django.db.backends.sqlite3',

            'NAME':
                BASE_DIR / 'db.sqlite3',
        }
    }


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME':
            'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.MinimumLengthValidator',

        'OPTIONS': {
            'min_length': 8
        }
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.CommonPasswordValidator'
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.NumericPasswordValidator'
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC / MEDIA
# ============================================================

STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'

MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

FRONTEND_URL = os.environ.get(
    'FRONTEND_URL',
    'http://localhost:5173',
).strip().rstrip('/')


# ============================================================
# EMAIL - BREVO HTTPS API
# ============================================================

# Render Free blocks outbound SMTP ports. Second Life therefore sends
# transactional email through Brevo's HTTPS API instead.
#
# IMPORTANT:
# BREVO_API_KEY must exist only in the backend environment.
# Never put it in React/Vite/Vercel client-side code.

BREVO_API_KEY = os.environ.get(
    'BREVO_API_KEY',
    ''
).strip()

EMAIL_FROM_EMAIL = os.environ.get(
    'EMAIL_FROM_EMAIL',
    'givesthingsasecondlife@gmail.com'
).strip()

EMAIL_FROM_NAME = os.environ.get(
    'EMAIL_FROM_NAME',
    'Second Life'
).strip()

# Kept for compatibility with any existing code that reads this setting.
DEFAULT_FROM_EMAIL = EMAIL_FROM_EMAIL


# ============================================================
# OTP CONFIGURATION
# ============================================================

EMAIL_OTP_LENGTH = 6

EMAIL_OTP_EXPIRY_SECONDS = 90

EMAIL_OTP_MAX_ATTEMPTS = 5


# ============================================================
# REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),

    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.PageNumberPagination',

    'PAGE_SIZE': 12,
}


# ============================================================
# SIMPLE JWT
# ============================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':
        timedelta(days=7),

    'REFRESH_TOKEN_LIFETIME':
        timedelta(days=30),

    'ROTATE_REFRESH_TOKENS':
        True,

    'BLACKLIST_AFTER_ROTATION':
        False,

    'ALGORITHM':
        'HS256',

    'SIGNING_KEY':
        SECRET_KEY,

    'AUTH_HEADER_TYPES':
        ('Bearer',),

    'USER_ID_FIELD':
        'id',

    'USER_ID_CLAIM':
        'user_id',
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True
