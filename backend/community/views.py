from django.contrib.auth.models import User
from django.db.models import F, Prefetch, Q, Sum
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import (
    Connection,
    Conversation,
    DirectMessage,
    FoodListing,
    Invitation,
    Post,
    PostComment,
    PostReaction,
    PostView,
    SavedPost,
    SharedPost,
)
from .permissions import IsOwnerOrReadOnly, IsVerifiedMember
from .serializers import (
    ConnectionSerializer,
    ConversationSerializer,
    DirectMessageSerializer,
    FoodListingSerializer,
    InvitationSerializer,
    MemberSerializer,
    PostCommentSerializer,
    PostSerializer,
    SharedPostSerializer,
)


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer

    permission_classes = [
        permissions.IsAuthenticated,
        IsVerifiedMember,
        IsOwnerOrReadOnly,
    ]

    # JSON is now the preferred format because
    # Netlify Blob uploads return URLs / keys.
    #
    # Multipart/FormParser are retained so older
    # Django-uploaded posts still continue working.
    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    def base_queryset(self):
        return (
            Post.objects
            .select_related(
                "author",
                "author__profile",
            )
            .prefetch_related(
                "reactions",
                "saved_by",
                "unique_views",
                "community_shares",
                Prefetch(
                    "comments",
                    queryset=(
                        PostComment.objects
                        .select_related(
                            "author",
                            "author__profile",
                        )
                    ),
                ),
            )
        )

    def get_queryset(self):
        queryset = (
            self.base_queryset()
            .order_by("-created_at")
        )

        if (
            self.action == "list"
            and self.request.user.is_authenticated
        ):
            queryset = queryset.exclude(
                author=self.request.user
            )

        return queryset

    def perform_create(self, serializer):
        """
        Do NOT upload media here.

        React uploads the file to Netlify Blob first.

        Django receives fields such as:

        image_blob_key
        image_url
        image_original_name
        image_content_type

        video_blob_key
        video_url
        video_original_name
        video_content_type
        """

        serializer.save(
            author=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save()

    @action(
        detail=False,
        methods=["get"],
        url_path="my-posts",
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def my_posts(self, request):
        posts = (
            self.base_queryset()
            .filter(
                author=request.user
            )
            .order_by("-created_at")
        )

        serializer = PostSerializer(
            posts,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="reposts",
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def reposts(self, request):
        reposts = (
            SharedPost.objects
            .select_related(
                "shared_by",
                "shared_by__profile",
                "original_post",
                "original_post__author",
                "original_post__author__profile",
            )
            .prefetch_related(
                "original_post__reactions",
                "original_post__saved_by",
                "original_post__unique_views",
                "original_post__community_shares",
                "original_post__comments",
            )
            .exclude(
                shared_by=request.user
            )
            .order_by("-created_at")
        )

        serializer = SharedPostSerializer(
            reposts,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="user-reposts",
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def user_reposts(
        self,
        request,
    ):
        user_id = (
            request.query_params.get(
                "user_id"
            )
        )

        if not user_id:
            return Response(
                {
                    "user_id":
                        "User ID is required."
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        reposts = (
            SharedPost.objects
            .filter(
                shared_by_id=user_id
            )
            .select_related(
                "shared_by",
                "shared_by__profile",
                "original_post",
                "original_post__author",
                "original_post__author__profile",
            )
            .prefetch_related(
                "original_post__reactions",
                "original_post__saved_by",
                "original_post__unique_views",
                "original_post__community_shares",
                "original_post__comments",
            )
            .order_by("-created_at")
        )

        serializer = SharedPostSerializer(
            reposts,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def react(
        self,
        request,
        pk=None,
    ):
        post = self.get_object()

        reaction_type = (
            request.data.get(
                "reaction_type"
            )
        )

        valid_reactions = {
            "like",
            "love",
            "haha",
            "wow",
            "sad",
            "angry",
        }

        if (
            reaction_type
            not in valid_reactions
        ):
            return Response(
                {
                    "detail":
                        "Invalid reaction type."
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        reaction, _ = (
            PostReaction.objects
            .update_or_create(
                post=post,
                user=request.user,
                defaults={
                    "reaction_type":
                        reaction_type,
                },
            )
        )

        serializer = (
            self.get_serializer(
                post
            )
        )

        return Response(
            {
                "my_reaction":
                    reaction.reaction_type,

                "reaction_count":
                    serializer.data[
                        "reaction_count"
                    ],

                "reaction_summary":
                    serializer.data[
                        "reaction_summary"
                    ],
            }
        )

    @action(
        detail=True,
        methods=["delete"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def remove_reaction(
        self,
        request,
        pk=None,
    ):
        post = self.get_object()

        PostReaction.objects.filter(
            post=post,
            user=request.user,
        ).delete()

        serializer = (
            self.get_serializer(post)
        )

        return Response(
            {
                "my_reaction": None,

                "reaction_count":
                    serializer.data[
                        "reaction_count"
                    ],

                "reaction_summary":
                    serializer.data[
                        "reaction_summary"
                    ],
            }
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def toggle_save(
        self,
        request,
        pk=None,
    ):
        post = self.get_object()

        saved_post, created = (
            SavedPost.objects
            .get_or_create(
                post=post,
                user=request.user,
            )
        )

        if not created:
            saved_post.delete()

        return Response(
            {
                "saved": created,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.AllowAny
        ],
    )
    def record_view(
        self,
        request,
        pk=None,
    ):
        post = self.get_object()

        if request.user.is_authenticated:
            _, created = (
                PostView.objects
                .get_or_create(
                    post=post,
                    user=request.user,
                )
            )

        else:
            if (
                not request
                .session
                .session_key
            ):
                request.session.create()

            session_key = (
                request
                .session
                .session_key
            )

            _, created = (
                PostView.objects
                .get_or_create(
                    post=post,
                    user=None,
                    session_key=session_key,
                )
            )

        return Response(
            {
                "view_recorded":
                    created,

                "unique_view_count":
                    post
                    .unique_views
                    .count(),
            }
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def share_to_community(
        self,
        request,
        pk=None,
    ):
        post = self.get_object()

        message = (
            request.data.get(
                "message",
                "",
            )
            or ""
        ).strip()

        if len(message) > 2000:
            return Response(
                {
                    "message":
                        (
                            "Repost message "
                            "cannot exceed "
                            "2,000 characters."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        shared_post = (
            SharedPost.objects.create(
                original_post=post,
                shared_by=request.user,
                message=message,
            )
        )

        Post.objects.filter(
            pk=post.pk
        ).update(
            share_count=(
                F("share_count") + 1
            )
        )

        serializer = (
            SharedPostSerializer(
                shared_post,
                context={
                    "request": request,
                },
            )
        )

        return Response(
            serializer.data,
            status=(
                status
                .HTTP_201_CREATED
            ),
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def add_comment(
        self,
        request,
        pk=None,
    ):
        post = self.get_object()

        serializer = (
            PostCommentSerializer(
                data=request.data,
                context={
                    "request": request,
                },
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        comment = serializer.save(
            post=post,
            author=request.user,
        )

        return Response(
            PostCommentSerializer(
                comment,
                context={
                    "request": request,
                },
            ).data,
            status=(
                status
                .HTTP_201_CREATED
            ),
        )

class FoodListingViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        FoodListingSerializer
    )

    permission_classes = [
        permissions
        .IsAuthenticatedOrReadOnly,

        IsOwnerOrReadOnly,
    ]

    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    queryset = (
        FoodListing.objects
        .select_related(
            "owner",
            "owner__profile",
            "claimed_by",
            "claimed_by__profile",
        )
        .order_by("-created_at")
    )

    def perform_create(
        self,
        serializer,
    ):
        serializer.save(
            owner=self.request.user
        )

    def perform_update(
        self,
        serializer,
    ):
        serializer.save()

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        """
        Image has already been uploaded
        to Netlify Blob by React.

        Expected optional fields:

        image_blob_key
        image_url
        image_original_name
        image_content_type
        """

        serializer = (
            self.get_serializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        listing = serializer.save(
            owner=request.user
        )

        conversation = (
            Conversation.objects.create(
                conversation_type=(
                    "food_group"
                ),

                title=(
                    f"Food Sharing: "
                    f"{listing.title}"
                ),

                food_listing=listing,

                is_active=True,
            )
        )

        registered_users = (
            User.objects.filter(
                is_active=True,
                is_staff=False,
                is_superuser=False,
            )
        )

        conversation.participants.set(
            registered_users
        )

        conversation_serializer = (
            ConversationSerializer(
                conversation,
                context={
                    "request": request,
                },
            )
        )

        listing_serializer = (
            self.get_serializer(
                listing,
                context={
                    "request": request,
                },
            )
        )

        return Response(
            {
                "listing":
                    listing_serializer.data,

                "group_conversation":
                    conversation_serializer.data,

                "message":
                    (
                        "Food listing "
                        "published and "
                        "group chat created."
                    ),
            },
            status=(
                status
                .HTTP_201_CREATED
            ),
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def claim(
        self,
        request,
        pk=None,
    ):
        listing = self.get_object()

        if (
            listing.owner_id ==
            request.user.id
        ):
            return Response(
                {
                    "detail":
                        (
                            "You cannot reserve "
                            "your own listing."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        if (
            listing.status !=
            "available"
        ):
            return Response(
                {
                    "detail":
                        (
                            "This listing is "
                            "no longer available."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        listing.status = "reserved"

        listing.claimed_by = (
            request.user
        )

        listing.save(
            update_fields=[
                "status",
                "claimed_by",
            ]
        )

        conversation = getattr(
            listing,
            "group_conversation",
            None,
        )

        if conversation:
            conversation.participants.add(
                request.user
            )

        return Response(
            self.get_serializer(
                listing,
                context={
                    "request": request,
                },
            ).data,
            status=(
                status.HTTP_200_OK
            ),
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
        url_path="group-chat",
    )
    def group_chat(
        self,
        request,
        pk=None,
    ):
        listing = self.get_object()

        if (
            listing.status ==
            "collected"
        ):
            return Response(
                {
                    "detail":
                        (
                            "This group chat "
                            "has expired because "
                            "the food was collected."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        conversation = getattr(
            listing,
            "group_conversation",
            None,
        )

        if not conversation:
            conversation = (
                Conversation.objects
                .create(
                    conversation_type=(
                        "food_group"
                    ),

                    title=(
                        f"Food Sharing: "
                        f"{listing.title}"
                    ),

                    food_listing=listing,

                    is_active=True,
                )
            )

            conversation.participants.set(
                User.objects.filter(
                    is_active=True,
                    is_staff=False,
                    is_superuser=False,
                )
            )

        if not conversation.is_active:
            return Response(
                {
                    "detail":
                        (
                            "This food group "
                            "chat is closed."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        conversation.participants.add(
            request.user
        )

        return Response(
            ConversationSerializer(
                conversation,
                context={
                    "request": request,
                },
            ).data,
            status=(
                status.HTTP_200_OK
            ),
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
        url_path="mark-collected",
    )
    def mark_collected(
        self,
        request,
        pk=None,
    ):
        listing = self.get_object()

        if (
            listing.owner_id !=
            request.user.id
        ):
            return Response(
                {
                    "detail":
                        (
                            "Only the listing owner "
                            "can mark the food "
                            "as collected."
                        )
                },
                status=(
                    status
                    .HTTP_403_FORBIDDEN
                ),
            )

        if (
            listing.status !=
            "reserved"
        ):
            return Response(
                {
                    "detail":
                        (
                            "Only a reserved listing "
                            "can be marked as collected."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        if (
            listing.claimed_by_id
            is None
        ):
            return Response(
                {
                    "detail":
                        (
                            "This listing has not "
                            "been reserved by "
                            "another member."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        listing.status = (
            "collected"
        )

        listing.save(
            update_fields=[
                "status"
            ]
        )

        conversation = getattr(
            listing,
            "group_conversation",
            None,
        )

        if conversation:
            conversation.is_active = (
                False
            )

            conversation.save(
                update_fields=[
                    "is_active",
                    "updated_at",
                ]
            )

        return Response(
            self.get_serializer(
                listing,
                context={
                    "request": request,
                },
            ).data,
            status=(
                status.HTTP_200_OK
            ),
        )

class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InvitationSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Invitation.objects
            .filter(
                Q(sender=self.request.user)
                | Q(receiver=self.request.user)
            )
            .select_related(
                "sender",
                "sender__profile",
                "receiver",
                "receiver__profile",
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(
            sender=self.request.user
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def respond(self, request, pk=None):
        invitation = self.get_object()

        if invitation.receiver != request.user:
            return Response(
                {
                    "detail": (
                        "Only the invitation receiver "
                        "can respond."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        response_status = request.data.get("status")

        if response_status not in (
            "accepted",
            "declined",
        ):
            return Response(
                {
                    "detail": (
                        "Status must be accepted or declined."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if invitation.status != "pending":
            return Response(
                {
                    "detail": (
                        "This invitation has already "
                        "been responded to."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        invitation.status = response_status
        invitation.save(
            update_fields=["status"]
        )

        serializer = self.get_serializer(
            invitation,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def complete(self, request, pk=None):
        invitation = self.get_object()

        if request.user not in (
            invitation.sender,
            invitation.receiver,
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "complete this invitation."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if invitation.status != "accepted":
            return Response(
                {
                    "detail": (
                        "Only accepted invitations can "
                        "be marked as completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        invitation.status = "completed"
        invitation.save(
            update_fields=["status"]
        )

        serializer = self.get_serializer(
            invitation,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def stats(request):
    active_members = User.objects.filter(
        is_active=True
    ).count()

    meals_shared = Invitation.objects.filter(
        status="completed"
    ).count()

    waste_reduced = (
        FoodListing.objects
        .filter(status="collected")
        .aggregate(total=Sum("quantity_kg"))
        .get("total")
        or 0
    )

    return Response(
        {
            "members": active_members,
            "meals_shared": meals_shared,
            "waste_reduced_kg": float(
                waste_reduced
            ),
        },
        status=status.HTTP_200_OK,
    )


class MemberListView(generics.ListAPIView):
    serializer_class = MemberSerializer

    permission_classes = [
        permissions.IsAuthenticated,
        IsVerifiedMember,
    ]

    def get_queryset(self):
        queryset = (
            User.objects
            .filter(
                is_active=True,

                # Only normal users
                is_staff=False,
                is_superuser=False,
            )
            .exclude(
                pk=self.request.user.pk
            )
            .select_related("profile")
            .order_by(
                "first_name",
                "last_name",
                "email",
            )
        )

        q = (
            self.request
            .query_params
            .get("q", "")
            .strip()
        )

        # No search entered:
        # return all normal FoodKindl members.
        if not q:
            return queryset

        normalized_q = (
            q.lower()
            .strip()
            .replace("-", "_")
            .replace(" ", "_")
        )

        queryset = queryset.filter(
            Q(
                first_name__icontains=q
            )
            |
            Q(
                last_name__icontains=q
            )
            |
            Q(
                email__icontains=q
            )
            |
            Q(
                profile__postcode__icontains=q
            )
            |
            Q(
                profile__city__icontains=q
            )
            |
            Q(
                profile__locality__icontains=q
            )
            |
            Q(
                profile__college_workplace__icontains=q
            )
            |
            Q(
                profile__role__icontains=q
            )
            |
            Q(
                profile__interests__icontains=q
            )
            |
            Q(
                profile__dietary_preference__icontains=normalized_q
            )
        ).distinct()

        return queryset


class MemberDetailView(generics.RetrieveAPIView):
    serializer_class = MemberSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsVerifiedMember,
    ]
    lookup_field = "pk"

    def get_queryset(self):
        return (
            User.objects
            .filter(is_active=True)
            .select_related("profile")
        )


class ConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectionSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsVerifiedMember,
    ]

    http_method_names = [
        "get",
        "post",
        "delete",
        "head",
        "options",
    ]

    def get_queryset(self):
        return (
            Connection.objects
            .filter(
                Q(sender=self.request.user)
                | Q(receiver=self.request.user)
            )
            .select_related(
                "sender",
                "sender__profile",
                "receiver",
                "receiver__profile",
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save()

    @action(
        detail=False,
        methods=["get"],
    )
    def incoming(self, request):
        connections = self.get_queryset().filter(
            receiver=request.user,
            status="pending",
        )

        serializer = self.get_serializer(
            connections,
            many=True,
        )

        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
    )
    def sent(self, request):
        connections = self.get_queryset().filter(
            sender=request.user,
            status="pending",
        )

        serializer = self.get_serializer(
            connections,
            many=True,
        )

        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
    )
    def accepted(self, request):
        connections = self.get_queryset().filter(
            status="accepted",
        )

        serializer = self.get_serializer(
            connections,
            many=True,
        )

        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
    )
    def accept(self, request, pk=None):
        connection = self.get_object()

        if connection.receiver != request.user:
            return Response(
                {
                    "detail": (
                        "Only the receiver can accept "
                        "this connection request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if connection.status != "pending":
            return Response(
                {
                    "detail": (
                        "This request is no longer pending."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection.status = "accepted"
        connection.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(
                connection
            ).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def decline(self, request, pk=None):
        connection = self.get_object()

        if connection.receiver != request.user:
            return Response(
                {
                    "detail": (
                        "Only the receiver can decline "
                        "this connection request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if connection.status != "pending":
            return Response(
                {
                    "detail": (
                        "This request is no longer pending."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection.status = "declined"
        connection.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(
                connection
            ).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def cancel(self, request, pk=None):
        connection = self.get_object()

        if connection.sender != request.user:
            return Response(
                {
                    "detail": (
                        "Only the sender can cancel "
                        "this request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if connection.status != "pending":
            return Response(
                {
                    "detail": (
                        "Only pending requests "
                        "can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def remove(self, request, pk=None):
        connection = self.get_object()

        if request.user not in (
            connection.sender,
            connection.receiver,
        ):
            return Response(
                {
                    "detail": (
                        "You cannot remove "
                        "this connection."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if connection.status != "accepted":
            return Response(
                {
                    "detail": (
                        "This connection is not active."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsVerifiedMember,
    ]

    http_method_names = [
        "get",
        "post",
        "head",
        "options",
    ]

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(participants=self.request.user)
            .prefetch_related(
                "participants",
                "participants__profile",
                "messages",
                "messages__sender",
                "messages__sender__profile",
            )
            .distinct()
            .order_by("-updated_at")
        )

    def create(self, request, *args, **kwargs):
        member_id = request.data.get("user_id")

        if not member_id:
            return Response(
                {
                    "user_id": [
                        "Select a member to message."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member_id = int(member_id)
        except (TypeError, ValueError):
            return Response(
                {
                    "user_id": [
                        "Select a valid member."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            other_user = User.objects.get(
                id=member_id,
                is_active=True,
            )
        except User.DoesNotExist:
            return Response(
                {
                    "user_id": [
                        "This member was not found."
                    ]
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if other_user.id == request.user.id:
            return Response(
                {
                    "detail": (
                        "You cannot message yourself."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        required_participant_ids = {
            request.user.id,
            other_user.id,
        }

        candidate_conversations = (
            Conversation.objects
            .filter(
                conversation_type="direct",
                participants=request.user,
            )
            .filter(participants=other_user)
            .prefetch_related(
                "participants",
                "participants__profile",
            )
            .distinct()
            .order_by("-updated_at")
        )

        existing_conversation = None

        for candidate in candidate_conversations:
            participant_ids = set(
                candidate.participants.values_list(
                    "id",
                    flat=True,
                )
            )

            if participant_ids == required_participant_ids:
                existing_conversation = candidate
                break

        if existing_conversation:
            serializer = self.get_serializer(
                existing_conversation,
                context={"request": request},
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        conversation = Conversation.objects.create(
            conversation_type="direct",
            title="",
            is_active=True,
        )

        conversation.participants.set(
            [
                request.user,
                other_user,
            ]
        )

        serializer = self.get_serializer(
            conversation,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="messages",
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def messages(self, request, pk=None):
        conversation = self.get_object()

        if request.method == "GET":
            message_queryset = (
                conversation.messages
                .select_related(
                    "sender",
                    "sender__profile",
                )
                .order_by("created_at")
            )

            (
                message_queryset
                .exclude(sender=request.user)
                .filter(is_read=False)
                .update(is_read=True)
            )

            serializer = DirectMessageSerializer(
                message_queryset,
                many=True,
                context={"request": request},
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        if not conversation.is_active:
            return Response(
                {
                    "detail": (
                        "This conversation is no longer active."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DirectMessageSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        message = serializer.save(
            conversation=conversation,
            sender=request.user,
        )

        conversation.save(
            update_fields=["updated_at"]
        )

        response_serializer = DirectMessageSerializer(
            message,
            context={"request": request},
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="unread-count",
        permission_classes=[
            permissions.IsAuthenticated,
            IsVerifiedMember,
        ],
    )
    def unread_count(self, request):
        unread_total = (
            DirectMessage.objects
            .filter(
                conversation__participants=request.user,
                is_read=False,
            )
            .exclude(sender=request.user)
            .distinct()
            .count()
        )

        return Response(
            {"unread_count": unread_total},
            status=status.HTTP_200_OK,
        )