from .models import Profile


# ============================================================
# BLOCK / INTERACTION CHECK
# ============================================================

def users_are_blocked(
    user_a,
    user_b,
):

    if (
        not user_a
        or not user_b
    ):
        return False


    if (
        not user_a.is_authenticated
        or not user_b.is_authenticated
    ):
        return False


    if (
        user_a.id ==
        user_b.id
    ):
        return False


    profile_a, _ = (
        Profile.objects.get_or_create(
            user=user_a
        )
    )


    profile_b, _ = (
        Profile.objects.get_or_create(
            user=user_b
        )
    )


    blocked_by_a = (
        profile_a
        .blocked_users
        .filter(
            id=user_b.id
        )
        .exists()
    )


    blocked_by_b = (
        profile_b
        .blocked_users
        .filter(
            id=user_a.id
        )
        .exists()
    )


    return (
        blocked_by_a
        or blocked_by_b
    )