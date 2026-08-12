from rest_framework import (
    generics,
    permissions,
    status,
)

from rest_framework.parsers import (
    FormParser,
    JSONParser,
    MultiPartParser,
)

from rest_framework.response import Response

from rest_framework.views import APIView

from .models import Profile

from .serializers import (
    EmailLoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)


# ============================================================
# REGISTER
# ============================================================

class RegisterView(
    generics.CreateAPIView
):
    permission_classes = [
        permissions.AllowAny,
    ]

    serializer_class = (
        RegisterSerializer
    )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = (
            self.get_serializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            UserSerializer(
                user,
                context={
                    "request": request,
                },
            ).data,
            status=(
                status.HTTP_201_CREATED
            ),
        )


# ============================================================
# EMAIL LOGIN
# ============================================================

class EmailLoginView(
    APIView
):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(
        self,
        request,
    ):
        serializer = (
            EmailLoginSerializer(
                data=request.data,
                context={
                    "request": request,
                },
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response(
            serializer.validated_data,
            status=(
                status.HTTP_200_OK
            ),
        )


# ============================================================
# CURRENT USER
# ============================================================

class MeView(
    APIView
):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(
        self,
        request,
    ):
        # Ensure old users also
        # have a profile.
        Profile.objects.get_or_create(
            user=request.user
        )

        serializer = (
            UserSerializer(
                request.user,
                context={
                    "request": request,
                },
            )
        )

        return Response(
            serializer.data,
            status=(
                status.HTTP_200_OK
            ),
        )


# ============================================================
# PROFILE
# ============================================================

class ProfileUpdateView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = (
        ProfileSerializer
    )

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    # Supports:
    #
    # multipart/form-data
    # application/x-www-form-urlencoded
    # application/json
    #
    # Blob URLs / keys can therefore
    # be sent normally from React.
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_object(
        self,
    ):
        profile, _ = (
            Profile.objects.get_or_create(
                user=self.request.user
            )
        )

        return profile

    def retrieve(
        self,
        request,
        *args,
        **kwargs,
    ):
        profile = (
            self.get_object()
        )

        serializer = (
            self.get_serializer(
                profile
            )
        )

        return Response(
            serializer.data,
            status=(
                status.HTTP_200_OK
            ),
        )

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):
        partial = kwargs.pop(
            "partial",
            False,
        )

        profile = (
            self.get_object()
        )

        serializer = (
            self.get_serializer(
                profile,
                data=request.data,
                partial=partial,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        updated_profile = (
            serializer.save()
        )

        # Refresh data after save
        # so Blob URL/key values are
        # definitely returned.
        updated_profile.refresh_from_db()

        request.user.refresh_from_db()

        return Response(
            UserSerializer(
                request.user,
                context={
                    "request": request,
                },
            ).data,
            status=(
                status.HTTP_200_OK
            ),
        )


# ============================================================
# VERIFICATION STATUS
# ============================================================

class VerificationStatusView(
    APIView
):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(
        self,
        request,
    ):
        profile, _ = (
            Profile.objects.get_or_create(
                user=request.user
            )
        )

        government_id_uploaded = bool(
            profile.government_id_blob_key
            or profile.government_id
        )

        return Response(
            {
                "government_id_uploaded":
                    government_id_uploaded,

                "government_id_type":
                    profile.government_id_type,

                "verification_status":
                    profile.verification_status,

                "is_verified":
                    profile.is_verified,

                "rejection_reason":
                    profile.rejection_reason,

                "verified_at":
                    profile.verified_at,
            },
            status=(
                status.HTTP_200_OK
            ),
        )