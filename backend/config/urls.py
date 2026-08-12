from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Django Admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # Authentication
    path(
        "api/auth/",
        include("accounts.urls"),
    ),

    # JWT refresh
    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # Community
    path(
        "api/",
        include("community.urls"),
    ),

    # Website
    path(
        "api/website/",
        include("website.urls"),
    ),
]


# ============================================================
# LOCAL / LEGACY DJANGO MEDIA
# ============================================================
#
# New images/videos are stored in Netlify Blob.
#
# This is kept for:
# - local development
# - existing Django media files
#
# Do not use Django MEDIA_ROOT to serve production
# Netlify Blob files.
# ============================================================

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )