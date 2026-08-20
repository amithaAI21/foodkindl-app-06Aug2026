from django.contrib.auth.models import User

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
    BlockedMemberSerializer,
    EmailLoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)

from .utils import (
    users_are_blocked,
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


        user = (
            serializer.save()
        )


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
            status=status.HTTP_200_OK,
        )


# ============================================================
# PROFILE UPDATE
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
            status=status.HTTP_200_OK,
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


        updated_profile.refresh_from_db()

        request.user.refresh_from_db()


        return Response(

            UserSerializer(

                request.user,

                context={
                    "request": request,
                },

            ).data,

            status=status.HTTP_200_OK,

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
            or profile.government_id_url
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

            status=status.HTTP_200_OK,

        )

# ============================================================
# BLOCKED MEMBERS LIST
# ============================================================

class BlockedMembersView(
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


        blocked_members = (

            profile
            .blocked_users
            .select_related(
                "profile"
            )
            .order_by(
                "first_name",
                "last_name",
                "id",
            )

        )


        serializer = (
            BlockedMemberSerializer(

                blocked_members,

                many=True,

                context={
                    "request": request,
                },

            )
        )


        return Response(

            serializer.data,

            status=status.HTTP_200_OK,

        )


# ============================================================
# BLOCK MEMBER
# ============================================================

class BlockMemberView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def post(
        self,
        request,
        user_id,
    ):

        # Cannot block yourself

        if (
            request.user.id ==
            user_id
        ):

            return Response(
                {
                    "detail":
                        "You cannot block yourself."
                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )


        # Find member

        try:

            member = (
                User.objects.get(
                    id=user_id,
                    is_active=True,
                )
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                        "Member not found."
                },

                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )


        profile, _ = (
            Profile.objects.get_or_create(
                user=request.user
            )
        )


        # Already blocked

        if (
            profile
            .blocked_users
            .filter(
                id=member.id
            )
            .exists()
        ):

            return Response(
                {

                    "detail":
                        "Member is already blocked.",

                    "blocked_user_id":
                        member.id,

                },

                status=status.HTTP_200_OK,

            )


        # Block member

        profile.blocked_users.add(
            member
        )


        return Response(
            {

                "detail":
                    "Member blocked successfully.",

                "blocked_user_id":
                    member.id,

            },

            status=status.HTTP_200_OK,

        )


# ============================================================
# UNBLOCK MEMBER
# ============================================================

class UnblockMemberView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def post(
        self,
        request,
        user_id,
    ):

        try:

            member = (
                User.objects.get(
                    id=user_id
                )
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                        "Member not found."
                },

                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )


        profile, _ = (
            Profile.objects.get_or_create(
                user=request.user
            )
        )


        profile.blocked_users.remove(
            member
        )


        return Response(
            {

                "detail":
                    "Member unblocked successfully.",

                "blocked_user_id":
                    member.id,

            },

            status=status.HTTP_200_OK,

        )


# ============================================================
# BLOCK STATUS
# ============================================================

class BlockStatusView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def get(
        self,
        request,
        user_id,
    ):

        # Own profile

        if (
            request.user.id ==
            user_id
        ):

            return Response(
                {

                    "blocked_by_me":
                        False,

                    "interaction_blocked":
                        False,

                },

                status=status.HTTP_200_OK,

            )


        try:

            member = (
                User.objects.get(
                    id=user_id
                )
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                        "Member not found."
                },

                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )


        profile, _ = (
            Profile.objects.get_or_create(
                user=request.user
            )
        )


        blocked_by_me = (

            profile
            .blocked_users
            .filter(
                id=member.id
            )
            .exists()

        )


        interaction_blocked = (
            users_are_blocked(
                request.user,
                member,
            )
        )


        return Response(
            {

                "blocked_by_me":
                    blocked_by_me,

                "interaction_blocked":
                    interaction_blocked,

            },

            status=status.HTTP_200_OK,

        )