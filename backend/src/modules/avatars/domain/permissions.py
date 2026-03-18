from src.modules.avatars.models import Avatar, AvatarBuildState


def _org_membership_enabled() -> bool:
    # Membership/admin model is not implemented yet.
    # Restrict org avatar access to owner-only until org membership exists.
    return False


def can_read_avatar(avatar: Avatar, user_id: str) -> bool:
    if avatar.build_state == AvatarBuildState.SOFT_DELETED:
        return avatar.owner_id == user_id

    if avatar.owner_id == user_id:
        return True

    if avatar.ownership_scope == "org":
        if not _org_membership_enabled():
            return False
        # Placeholder branch until org membership model exists.
        return False

    return bool(avatar.is_public)


def can_edit_avatar(avatar: Avatar, user_id: str) -> bool:
    if avatar.owner_id == user_id:
        return True

    if avatar.ownership_scope == "org" and _org_membership_enabled():
        # Placeholder branch until org membership model exists.
        return False

    return False


def can_use_avatar(avatar: Avatar, user_id: str) -> bool:
    if avatar.build_state != AvatarBuildState.READY:
        return False

    if avatar.owner_id == user_id:
        return True

    if avatar.ownership_scope == "org" and _org_membership_enabled():
        # Placeholder branch until org membership model exists.
        return False

    return False


def can_toggle_visibility(avatar: Avatar, user_id: str) -> bool:
    return avatar.owner_id == user_id


def can_clone_avatar(avatar: Avatar) -> bool:
    return (
        avatar.build_state == AvatarBuildState.READY
        and avatar.is_public
        and avatar.ownership_scope == "personal"
        and avatar.source_type == "original"
        and avatar.deleted_at is None
    )
