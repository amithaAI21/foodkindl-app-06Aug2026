from django.utils import timezone

from rest_framework import (
    permissions,
    status,
)

from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    SOSEvent,
    TrustedContact,
)

from .serializers import (
    SOSEventSerializer,
    TrustedContactSerializer,
)

from .services import (
    send_sos_to_contacts,
)


# ============================================================
# TRUSTED CONTACTS
# ============================================================

class TrustedContactsView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def get(
        self,
        request,
    ):

        contacts = (
            TrustedContact.objects
            .filter(
                user=request.user,
                is_active=True,
            )
            .order_by(
                "-created_at"
            )
        )


        serializer = (
            TrustedContactSerializer(
                contacts,
                many=True,
            )
        )


        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


    def post(
        self,
        request,
    ):

        count = (
            TrustedContact.objects
            .filter(
                user=request.user,
                is_active=True,
            )
            .count()
        )


        if count >= 3:

            return Response(
                {
                    "detail":
                        "You can add up to 3 trusted contacts."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        serializer = (
            TrustedContactSerializer(
                data=request.data
            )
        )


        serializer.is_valid(
            raise_exception=True
        )


        contact = (
            serializer.save(
                user=request.user
            )
        )


        return Response(
            TrustedContactSerializer(
                contact
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# DELETE TRUSTED CONTACT
# ============================================================

class TrustedContactDeleteView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def delete(
        self,
        request,
        contact_id,
    ):

        try:

            contact = (
                TrustedContact.objects
                .get(
                    id=contact_id,
                    user=request.user,
                )
            )


        except TrustedContact.DoesNotExist:

            return Response(
                {
                    "detail":
                        "Trusted contact not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


        contact.delete()


        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# CREATE SOS + SEND SMS
# ============================================================

class SOSCreateView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def post(
        self,
        request,
    ):

        # ====================================================
        # CHECK EXISTING SOS
        # ====================================================

        existing_sos = (
            SOSEvent.objects
            .filter(
                user=request.user,
                status="active",
            )
            .order_by(
                "-activated_at"
            )
            .first()
        )


        if existing_sos:

            return Response(
                {
                    "id":
                        existing_sos.id,

                    "status":
                        existing_sos.status,

                    "latitude":
                        existing_sos.latitude,

                    "longitude":
                        existing_sos.longitude,

                    "location_accuracy":
                        existing_sos.location_accuracy,

                    "activated_at":
                        existing_sos.activated_at,

                    "detail":
                        "SOS is already active.",
                },
                status=status.HTTP_200_OK,
            )


        # ====================================================
        # CREATE SOS EVENT
        # ====================================================

        serializer = (
            SOSEventSerializer(
                data=request.data
            )
        )


        serializer.is_valid(
            raise_exception=True
        )


        sos_event = (
            serializer.save(
                user=request.user,
                status="active",
            )
        )


        # ====================================================
        # GET TRUSTED CONTACTS
        # ====================================================

        trusted_contacts = list(
            TrustedContact.objects
            .filter(
                user=request.user,
                is_active=True,
            )
            .order_by(
                "id"
            )
        )


        # ====================================================
        # SEND SMS
        # ====================================================

        sms_results = []


        if trusted_contacts:

            sms_results = (
                send_sos_to_contacts(
                    user=request.user,
                    sos_event=sos_event,
                    contacts=trusted_contacts,
                )
            )


        sms_attempted = (
            len(
                sms_results
            )
        )


        sms_started = (
            sum(
                1
                for item
                in sms_results
                if item.get(
                    "success"
                )
            )
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        return Response(
            {
                "id":
                    sos_event.id,

                "status":
                    sos_event.status,

                "latitude":
                    sos_event.latitude,

                "longitude":
                    sos_event.longitude,

                "location_accuracy":
                    sos_event.location_accuracy,

                "activated_at":
                    sos_event.activated_at,

                "trusted_contacts_count":
                    len(
                        trusted_contacts
                    ),

                "sms_attempted":
                    sms_attempted,

                "sms_started":
                    sms_started,

                "sms_results":
                    sms_results,

                "detail":
                    (
                        (
                            f"SOS activated. "
                            f"{sms_started} SMS alert(s) submitted."
                        )
                        if sms_started > 0
                        else
                        (
                            "SOS activated, but no SMS "
                            "alert could be submitted."
                        )
                    ),
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# ACTIVE SOS
# ============================================================

class ActiveSOSView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def get(
        self,
        request,
    ):

        sos = (
            SOSEvent.objects
            .filter(
                user=request.user,
                status="active",
            )
            .order_by(
                "-activated_at"
            )
            .first()
        )


        if not sos:

            return Response(
                {
                    "active":
                        False,

                    "sos":
                        None,
                },
                status=status.HTTP_200_OK,
            )


        return Response(
            {
                "active":
                    True,

                "sos":
                    SOSEventSerializer(
                        sos
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# MARK SAFE
# ============================================================

class SOSMarkSafeView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def post(
        self,
        request,
        sos_id,
    ):

        try:

            sos = (
                SOSEvent.objects
                .get(
                    id=sos_id,
                    user=request.user,
                )
            )


        except SOSEvent.DoesNotExist:

            return Response(
                {
                    "detail":
                        "SOS event not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


        if sos.status == "safe":

            return Response(
                {
                    "detail":
                        "SOS is already marked safe.",

                    "sos":
                        SOSEventSerializer(
                            sos
                        ).data,
                },
                status=status.HTTP_200_OK,
            )


        sos.status = "safe"

        sos.resolved_at = (
            timezone.now()
        )


        sos.save(
            update_fields=[
                "status",
                "resolved_at",
            ]
        )


        return Response(
            {
                "detail":
                    "You have been marked safe.",

                "sos":
                    SOSEventSerializer(
                        sos
                    ).data,
            },
            status=status.HTTP_200_OK,
        )