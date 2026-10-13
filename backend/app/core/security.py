import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Header, HTTPException
from jose import JWTError, jwt
from uuid import uuid4
from app.core.config import settings


def create_admin_token() -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": "admin",
        "role": "admin",
        "iss": "signsight-api",
        "aud": "signsight-admin",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=30),
        "jti": str(uuid4()),
    }

    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_alg,
    )

def verify_admin_credentials(username: str, password: str) -> bool:
    username_ok = secrets.compare_digest(
        username.encode("utf-8"),
        settings.admin_user.encode("utf-8")
    )

    if not username_ok:
        return False

    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            settings.admin_pass_hash.encode("utf-8")
        )
    except (ValueError, TypeError):
        return False

    # Temporary fallback while migrating
    return secrets.compare_digest(
        password.encode("utf-8"),
        settings.admin_pass.encode("utf-8")
    )


def require_admin(
    authorization: str | None = Header(None),
) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing token",
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_alg],
            audience="signsight-admin",
            issuer="signsight-api",
            subject="admin",
            options={
                "require_sub": True,
                "require_iat": True,
                "require_exp": True,
                "require_nbf": True,
                "require_iss": True,
                "require_aud": True,
                "require_jti": True,
            },
        )

    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        ) from exc

    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return "admin"