from django.contrib.auth.models import User
from django.db import models


# ============================================================
# COMMUNITY POST
# ============================================================

class Post(models.Model):

    POST_TYPE_CHOICES = [
        ("post", "Post"),
        ("article", "Article"),
        ("image", "Image"),
        ("video", "Video"),
    ]


    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts",
    )


    post_type = models.CharField(
        max_length=20,
        choices=POST_TYPE_CHOICES,
        default="post",
        db_index=True,
    )


    title = models.CharField(
        max_length=200,
        blank=True,
    )


    text = models.TextField(
        blank=True,
    )


    # ========================================================
    # LEGACY DJANGO MEDIA
    #
    # Keep temporarily so old records
    # continue working.
    # New uploads should use Blob fields below.
    # ========================================================

    image = models.ImageField(
        upload_to="posts/images/",
        blank=True,
        null=True,
    )


    video = models.FileField(
        upload_to="posts/videos/",
        blank=True,
        null=True,
    )


    # ========================================================
    # NETLIFY BLOB IMAGE
    # ========================================================

    image_blob_key = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )


    image_url = models.URLField(
        max_length=1200,
        blank=True,
        default="",
    )


    image_original_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )


    image_content_type = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )


    # ========================================================
    # NETLIFY BLOB VIDEO
    # ========================================================

    video_blob_key = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )


    video_url = models.URLField(
        max_length=1200,
        blank=True,
        default="",
    )


    video_original_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )


    video_content_type = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )


    location_name = models.CharField(
        max_length=180,
        blank=True,
    )


    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
    )


    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
    )


    share_count = models.PositiveIntegerField(
        default=0,
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )


    class Meta:
        ordering = [
            "-created_at"
        ]


    def __str__(self):
        return (
            self.title
            or self.text[:50]
            or (
                f"{self.author.email} "
                f"({self.post_type})"
            )
        )


# ============================================================
# POST REACTION
# ============================================================

class PostReaction(models.Model):

    REACTION_CHOICES = [
        ("like", "Like"),
        ("love", "Love"),
        ("haha", "Haha"),
        ("wow", "Wow"),
        ("sad", "Sad"),
        ("angry", "Angry"),
    ]


    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="reactions",
    )


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="post_reactions",
    )


    reaction_type = models.CharField(
        max_length=20,
        choices=REACTION_CHOICES,
        default="like",
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
    )


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "post",
                    "user",
                ],
                name=(
                    "unique_user_reaction_per_post"
                ),
            )
        ]


    def __str__(self):
        return (
            f"{self.user.email} reacted "
            f"{self.reaction_type} "
            f"to post {self.post_id}"
        )


# ============================================================
# SAVED POST
# ============================================================

class SavedPost(models.Model):

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="saved_by",
    )


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="saved_posts",
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
    )


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "post",
                    "user",
                ],
                name="unique_saved_post",
            )
        ]


    def __str__(self):
        return (
            f"{self.user.email} "
            f"saved post {self.post_id}"
        )


# ============================================================
# POST VIEW
# ============================================================

class PostView(models.Model):

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="unique_views",
    )


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="viewed_posts",
        blank=True,
        null=True,
    )


    session_key = models.CharField(
        max_length=100,
        blank=True,
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
    )


    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "post",
                    "user",
                ],
                condition=models.Q(
                    user__isnull=False
                ),
                name=(
                    "unique_authenticated_post_view"
                ),
            ),

            models.UniqueConstraint(
                fields=[
                    "post",
                    "session_key",
                ],
                condition=~models.Q(
                    session_key=""
                ),
                name=(
                    "unique_anonymous_session_post_view"
                ),
            ),
        ]


    def __str__(self):

        viewer = (
            self.user.email
            if self.user
            else self.session_key
        )

        return (
            f"{viewer} viewed "
            f"post {self.post_id}"
        )


# ============================================================
# SHARED POST
# ============================================================

class SharedPost(models.Model):

    original_post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="community_shares",
    )


    shared_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="shared_posts",
    )


    message = models.TextField(
        blank=True,
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
    )


    class Meta:
        ordering = [
            "-created_at"
        ]


    def __str__(self):
        return (
            f"{self.shared_by.email} "
            f"shared post "
            f"{self.original_post_id}"
        )


# ============================================================
# POST COMMENT
# ============================================================

class PostComment(models.Model):

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )


    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="post_comments",
    )


    text = models.TextField()


    created_at = models.DateTimeField(
        auto_now_add=True,
    )


    class Meta:
        ordering = [
            "created_at"
        ]


    def __str__(self):
        return (
            f"{self.author.email}: "
            f"{self.text[:40]}"
        )


# ============================================================
# FOOD LISTING
# ============================================================

class FoodListing(models.Model):

    STATUS_CHOICES = [
        (
            "available",
            "Available",
        ),
        (
            "reserved",
            "Reserved",
        ),
        (
            "collected",
            "Collected",
        ),
    ]


    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="food_listings",
    )


    title = models.CharField(
        max_length=160,
    )


    description = models.TextField()


    quantity = models.CharField(
        max_length=100,
    )


    quantity_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
    )


    location = models.CharField(
        max_length=180,
    )


    pickup_time = models.DateTimeField()


    allergens = models.CharField(
        max_length=300,
        blank=True,
    )


    packaging = models.CharField(
        max_length=300,
        blank=True,
    )


    pickup_instructions = models.TextField(
        blank=True,
    )


    # ========================================================
    # LEGACY DJANGO IMAGE
    # ========================================================

    image = models.ImageField(
        upload_to="food/",
        blank=True,
        null=True,
    )


    # ========================================================
    # NETLIFY BLOB IMAGE
    # ========================================================

    image_blob_key = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )


    image_url = models.URLField(
        max_length=1200,
        blank=True,
        default="",
    )


    image_original_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )


    image_content_type = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="available",
        db_index=True,
    )


    claimed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="claimed_food",
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )


    class Meta:
        ordering = [
            "-created_at"
        ]


    def __str__(self):
        return (
            f"{self.title} - "
            f"{self.status}"
        )


# ============================================================
# INVITATION
# ============================================================

class Invitation(models.Model):

    MEET_TYPE_CHOICES = [
        (
            "public",
            "Public venue",
        ),
        (
            "private",
            "Private home",
        ),
        (
            "online",
            "Online cooking session",
        ),
    ]


    STATUS_CHOICES = [
        (
            "pending",
            "Pending",
        ),
        (
            "accepted",
            "Accepted",
        ),
        (
            "declined",
            "Declined",
        ),
        (
            "cancelled",
            "Cancelled",
        ),
        (
            "completed",
            "Completed",
        ),
    ]


    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_invitations",
    )


    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_invitations",
    )


    title = models.CharField(
        max_length=160,
    )


    note = models.TextField(
        blank=True,
    )


    cuisine = models.CharField(
        max_length=100,
        blank=True,
    )


    location = models.CharField(
        max_length=180,
    )


    scheduled_for = (
        models.DateTimeField()
    )


    meet_type = models.CharField(
        max_length=20,
        choices=MEET_TYPE_CHOICES,
        default="public",
    )


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        db_index=True,
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )


    class Meta:
        ordering = [
            "-created_at"
        ]


    def __str__(self):
        return (
            f"{self.title}: "
            f"{self.sender.email} → "
            f"{self.receiver.email}"
        )


# ============================================================
# CONNECTION
# ============================================================

class Connection(models.Model):

    STATUS_CHOICES = [
        (
            "pending",
            "Pending",
        ),
        (
            "accepted",
            "Accepted",
        ),
        (
            "declined",
            "Declined",
        ),
    ]


    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name=(
            "sent_connection_requests"
        ),
    )


    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name=(
            "received_connection_requests"
        ),
    )


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        db_index=True,
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
    )


    updated_at = models.DateTimeField(
        auto_now=True,
    )


    class Meta:

        ordering = [
            "-created_at"
        ]


        constraints = [

            models.UniqueConstraint(
                fields=[
                    "sender",
                    "receiver",
                ],
                name=(
                    "unique_connection_request"
                ),
            ),

            models.CheckConstraint(
                condition=~models.Q(
                    sender=models.F(
                        "receiver"
                    )
                ),
                name=(
                    "prevent_self_connection"
                ),
            ),
        ]


    def __str__(self):
        return (
            f"{self.sender.email} → "
            f"{self.receiver.email} "
            f"({self.status})"
        )


# ============================================================
# CONVERSATION
# ============================================================

class Conversation(models.Model):

    CONVERSATION_TYPE_CHOICES = [
        (
            "direct",
            "Direct",
        ),
        (
            "food_group",
            "Food Group",
        ),
    ]


    participants = (
        models.ManyToManyField(
            User,
            related_name=(
                "chat_conversations"
            ),
        )
    )


    conversation_type = (
        models.CharField(
            max_length=20,
            choices=(
                CONVERSATION_TYPE_CHOICES
            ),
            default="direct",
            db_index=True,
        )
    )


    title = models.CharField(
        max_length=200,
        blank=True,
    )


    food_listing = (
        models.OneToOneField(
            "FoodListing",
            on_delete=models.CASCADE,
            related_name=(
                "group_conversation"
            ),
            null=True,
            blank=True,
        )
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
            "-updated_at"
        ]


    def __str__(self):

        if (
            self.conversation_type
            == "food_group"
        ):
            return (
                self.title
                or (
                    f"Food group "
                    f"{self.id}"
                )
            )


        participant_names = ", ".join(
            self.participants
            .values_list(
                "email",
                flat=True,
            )
        )


        return (
            f"Conversation {self.id}: "
            f"{participant_names}"
        )


# ============================================================
# DIRECT MESSAGE
# ============================================================

class DirectMessage(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )


    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name=(
            "sent_direct_messages"
        ),
    )


    text = models.TextField()


    is_read = models.BooleanField(
        default=False,
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )


    class Meta:
        ordering = [
            "created_at"
        ]


    def __str__(self):
        return (
            f"{self.sender.email}: "
            f"{self.text[:40]}"
        )