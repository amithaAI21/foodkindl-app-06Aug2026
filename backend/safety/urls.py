from django.urls import path

from .views import (
    ActiveSOSView,
    SOSCreateView,
    SOSMarkSafeView,
    TrustedContactDeleteView,
    TrustedContactsView,
)


urlpatterns = [

    path(
        "trusted-contacts/",
        TrustedContactsView.as_view(),
        name="trusted-contacts",
    ),

    path(
        "trusted-contacts/<int:contact_id>/",
        TrustedContactDeleteView.as_view(),
        name="trusted-contact-delete",
    ),

    path(
        "sos/",
        SOSCreateView.as_view(),
        name="sos-create",
    ),

    path(
        "sos/active/",
        ActiveSOSView.as_view(),
        name="sos-active",
    ),

    path(
        "sos/<int:sos_id>/safe/",
        SOSMarkSafeView.as_view(),
        name="sos-safe",
    ),

]