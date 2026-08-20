from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(
    admin.ModelAdmin
):

    list_display = (
        "user",
        "city",
        "gender",
        "dietary_preference",
        "verification_status",
        "is_verified",
        "created_at",
    )


    list_filter = (
        "gender",
        "dietary_preference",
        "verification_status",
        "is_verified",
        "women_only_mode",
    )


    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "city",
        "locality",
    )


    readonly_fields = (
        "created_at",
        "updated_at",
        "verified_at",
    )


    filter_horizontal = (
        "blocked_users",
    )