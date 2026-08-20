from django.contrib.auth.models import User
from django.db import models


class TrustedContact(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="trusted_contacts",
    )

    name = models.CharField(
        max_length=120,
    )

    relationship = models.CharField(
        max_length=80,
        blank=True,
    )

    phone_number = models.CharField(
        max_length=20,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )


    class Meta:
        ordering = [
            "-created_at",
        ]


    def __str__(self):
        return (
            f"{self.name} - "
            f"{self.user.email}"
        )


class SOSEvent(models.Model):

    STATUS_CHOICES = [
        (
            "active",
            "Active",
        ),
        (
            "safe",
            "User Marked Safe",
        ),
        (
            "cancelled",
            "Cancelled",
        ),
    ]


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sos_events",
    )


    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )


    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )


    location_accuracy = models.FloatField(
        null=True,
        blank=True,
    )


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
        db_index=True,
    )


    activated_at = models.DateTimeField(
        auto_now_add=True,
    )


    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
    )


    class Meta:
        ordering = [
            "-activated_at",
        ]


    def __str__(self):
        return (
            f"SOS - {self.user.email} - "
            f"{self.status}"
        )