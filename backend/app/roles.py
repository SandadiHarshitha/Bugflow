from fastapi import Depends, HTTPException, status
from app.auth import get_current_user
from app.models import User


ROLE_ALIASES = {
    "developer": "Developer",
    "dev": "Developer",
    "tester": "Tester",
    "qa": "Tester",
    "manager": "Manager",
    "admin": "Admin",
}


def normalize_role(role: str | None) -> str:
    value = str(role or "").strip().lower()
    return ROLE_ALIASES.get(value, str(role or "").strip())


def require_roles(*allowed_roles: str):
    allowed = {
        normalize_role(role)
        for role in allowed_roles
    }

    def dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        current_role = normalize_role(current_user.role)

        if current_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied. Required role: "
                    f"{', '.join(sorted(allowed))}"
                ),
            )

        return current_user

    return dependency