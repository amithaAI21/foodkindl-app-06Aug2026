from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile


# ============================================================
# PROFILE SERIALIZER
# ============================================================

class ProfileSerializer(serializers.ModelSerializer):

    government_id_uploaded = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Profile

        fields = (
            # Normal profile fields
            "bio",
            "city",
            "locality",
            "postcode",
            "college_workplace",
            "role",
            "interests",
            "gender",
            "dietary_preference",
            "women_only_mode",

            # -----------------------------------------------
            # OLD DJANGO PROFILE PHOTOS
            # -----------------------------------------------
            "profile_image_1",
            "profile_image_2",
            "profile_image_3",

            # -----------------------------------------------
            # NETLIFY BLOB PROFILE PHOTOS
            # -----------------------------------------------
            "profile_image_1_blob_key",
            "profile_image_1_url",

            "profile_image_2_blob_key",
            "profile_image_2_url",

            "profile_image_3_blob_key",
            "profile_image_3_url",

            # -----------------------------------------------
            # OLD GOVERNMENT ID
            # -----------------------------------------------
            "government_id",

            # -----------------------------------------------
            # NETLIFY BLOB GOVERNMENT ID
            # -----------------------------------------------
            "government_id_blob_key",
            "government_id_original_name",
            "government_id_content_type",

            "government_id_uploaded",
            "government_id_type",

            # Verification
            "verification_status",
            "is_verified",
            "verified_at",
            "rejection_reason",
        )

        read_only_fields = (
            "government_id_uploaded",
            "verification_status",
            "is_verified",
            "verified_at",
            "rejection_reason",
        )

        extra_kwargs = {

            # -----------------------------------------------
            # Legacy Django photos
            # -----------------------------------------------

            "profile_image_1": {
                "required": False,
                "allow_null": True,
            },

            "profile_image_2": {
                "required": False,
                "allow_null": True,
            },

            "profile_image_3": {
                "required": False,
                "allow_null": True,
            },

            # -----------------------------------------------
            # Blob profile photo 1
            # -----------------------------------------------

            "profile_image_1_blob_key": {
                "required": False,
                "allow_blank": True,
            },

            "profile_image_1_url": {
                "required": False,
                "allow_blank": True,
            },

            # -----------------------------------------------
            # Blob profile photo 2
            # -----------------------------------------------

            "profile_image_2_blob_key": {
                "required": False,
                "allow_blank": True,
            },

            "profile_image_2_url": {
                "required": False,
                "allow_blank": True,
            },

            # -----------------------------------------------
            # Blob profile photo 3
            # -----------------------------------------------

            "profile_image_3_blob_key": {
                "required": False,
                "allow_blank": True,
            },

            "profile_image_3_url": {
                "required": False,
                "allow_blank": True,
            },

            # -----------------------------------------------
            # Legacy Government ID
            # -----------------------------------------------

            "government_id": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            },

            # -----------------------------------------------
            # Blob Government ID
            # -----------------------------------------------

            "government_id_blob_key": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
            },

            "government_id_original_name": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
            },

            "government_id_content_type": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
            },

            "government_id_type": {
                "required": False,
                "allow_blank": True,
            },
        }

    # ========================================================
    # GOVERNMENT ID UPLOADED
    # ========================================================

    def get_government_id_uploaded(
        self,
        obj,
    ):
        return bool(
            obj.government_id_blob_key
            or obj.government_id
        )

    # ========================================================
    # LEGACY IMAGE VALIDATION
    # ========================================================

    def validate_profile_image_1(
        self,
        uploaded_file,
    ):
        return self.validate_profile_image(
            uploaded_file
        )

    def validate_profile_image_2(
        self,
        uploaded_file,
    ):
        return self.validate_profile_image(
            uploaded_file
        )

    def validate_profile_image_3(
        self,
        uploaded_file,
    ):
        return self.validate_profile_image(
            uploaded_file
        )

    def validate_profile_image(
        self,
        uploaded_file,
    ):

        if not uploaded_file:
            return uploaded_file

        maximum_size = (
            10 * 1024 * 1024
        )

        if uploaded_file.size > maximum_size:
            raise serializers.ValidationError(
                "Profile image must be smaller than 10 MB."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        content_type = getattr(
            uploaded_file,
            "content_type",
            "",
        )

        if (
            content_type
            and content_type not in allowed_types
        ):
            raise serializers.ValidationError(
                "Upload a JPG, PNG, or WebP image."
            )

        return uploaded_file

    # ========================================================
    # LEGACY GOVERNMENT ID VALIDATION
    # ========================================================

    def validate_government_id(
        self,
        uploaded_file,
    ):

        if not uploaded_file:
            return uploaded_file

        maximum_size = (
            5 * 1024 * 1024
        )

        if uploaded_file.size > maximum_size:
            raise serializers.ValidationError(
                "Government ID must be smaller than 5 MB."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        }

        content_type = getattr(
            uploaded_file,
            "content_type",
            "",
        )

        if (
            content_type
            and content_type not in allowed_types
        ):
            raise serializers.ValidationError(
                "Upload a JPG, PNG, WebP, or PDF document."
            )

        return uploaded_file

    # ========================================================
    # VALIDATION
    # ========================================================

    def validate(
        self,
        attrs,
    ):

        government_id = attrs.get(
            "government_id"
        )

        government_id_blob_key = attrs.get(
            "government_id_blob_key"
        )

        government_id_type = attrs.get(
            "government_id_type"
        )

        # If an existing ID type already exists,
        # use it when only another profile field is updated.
        if not government_id_type:
            if self.instance:
                government_id_type = (
                    self.instance.government_id_type
                )

        if (
            government_id
            or government_id_blob_key
        ):
            if not government_id_type:
                raise serializers.ValidationError(
                    {
                        "government_id_type":
                            "Select the type of Government ID."
                    }
                )

        return attrs

    # ========================================================
    # UPDATE
    # ========================================================

    @transaction.atomic
    def update(
        self,
        instance,
        validated_data,
    ):

        new_government_id = (
            validated_data.get(
                "government_id"
            )
        )

        new_government_blob = (
            validated_data.get(
                "government_id_blob_key"
            )
        )

        # ----------------------------------------------------
        # Explicitly save every supplied field.
        # This includes Blob URLs and Blob keys.
        # ----------------------------------------------------

        for field, value in validated_data.items():

            setattr(
                instance,
                field,
                value,
            )

        # ----------------------------------------------------
        # New government ID means verification is pending.
        # ----------------------------------------------------

        if (
            new_government_id
            or new_government_blob
        ):

            instance.verification_status = (
                "pending"
            )

            instance.is_verified = False

            instance.verified_by = None

            instance.verified_at = None

            instance.rejection_reason = ""

        instance.save()

        return instance


# ============================================================
# USER SERIALIZER
# ============================================================

class UserSerializer(
    serializers.ModelSerializer
):

    profile = ProfileSerializer(
        read_only=True
    )

    full_name = (
        serializers.SerializerMethodField()
    )

    class Meta:

        model = User

        fields = (
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "profile",
        )

    def get_full_name(
        self,
        obj,
    ):

        return (
            obj.get_full_name().strip()
            or obj.email
        )


# ============================================================
# REGISTER
# ============================================================

class RegisterSerializer(
    serializers.ModelSerializer
):

    password = serializers.CharField(
        write_only=True,
        min_length=6,
        trim_whitespace=False,
    )

    class Meta:

        model = User

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "password",
        )

        read_only_fields = (
            "id",
        )

    def validate_email(
        self,
        value,
    ):

        email = (
            value.strip().lower()
        )

        if not email:

            raise serializers.ValidationError(
                "Email is required."
            )

        if User.objects.filter(
            email__iexact=email
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    @transaction.atomic
    def create(
        self,
        validated_data,
    ):

        password = (
            validated_data.pop(
                "password"
            )
        )

        email = (
            validated_data["email"]
            .strip()
            .lower()
        )

        user = User(
            username=email,
            email=email,

            first_name=(
                validated_data.get(
                    "first_name",
                    "",
                ).strip()
            ),

            last_name=(
                validated_data.get(
                    "last_name",
                    "",
                ).strip()
            ),
        )

        user.set_password(
            password
        )

        user.save()

        Profile.objects.get_or_create(
            user=user
        )

        return user


# ============================================================
# EMAIL LOGIN
# ============================================================

class EmailLoginSerializer(
    serializers.Serializer
):

    email = serializers.EmailField(
        write_only=True
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(
        self,
        attrs,
    ):

        email = (
            attrs["email"]
            .strip()
            .lower()
        )

        password = (
            attrs["password"]
        )

        try:

            database_user = (
                User.objects.get(
                    email__iexact=email
                )
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "detail":
                        "Invalid email or password."
                }
            )

        user = authenticate(
            request=self.context.get(
                "request"
            ),

            username=(
                database_user.username
            ),

            password=password,
        )

        if user is None:

            raise serializers.ValidationError(
                {
                    "detail":
                        "Invalid email or password."
                }
            )

        if not user.is_active:

            raise serializers.ValidationError(
                {
                    "detail":
                        "This account is disabled."
                }
            )

        Profile.objects.get_or_create(
            user=user
        )

        refresh = (
            RefreshToken.for_user(
                user
            )
        )

        return {
            "refresh":
                str(refresh),

            "access":
                str(
                    refresh.access_token
                ),

            "user":
                UserSerializer(
                    user,
                    context=self.context,
                ).data,
        }