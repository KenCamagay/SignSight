from dotenv import load_dotenv

from app.core.paths import ENV_FILE


load_dotenv(ENV_FILE)


class Settings:
    mongo_uri = "mongodb://127.0.0.1:27017"
    mongo_db = "signsight"
    jwt_secret = ""
    jwt_alg = "HS256"

    admin_user = ""
    admin_pass_hash = ""

    cors_allow_origins = ["*"]

    def __init__(self) -> None:
        import os

        self.mongo_uri = os.getenv("MONGO_URI", self.mongo_uri)
        self.mongo_db = os.getenv("MONGO_DB", self.mongo_db)

        self.jwt_secret = os.getenv("JWT_SECRET", self.jwt_secret)

        self.admin_user = os.getenv("ADMIN_USER", self.admin_user)
        self.admin_pass_hash = os.getenv(
            "ADMIN_PASS_HASH",
            self.admin_pass_hash
        )

        self._validate_auth_settings()

    def _validate_auth_settings(self) -> None:
        insecure_jwt_values = {
            "change_me",
            "change_me_now"
        }


        if (
            not self.jwt_secret
            or self.jwt_secret in insecure_jwt_values
            or len(self.jwt_secret) < 32
        ):
            raise RuntimeError(
                "JWT_SECRET must be set to a strong value "
                "(at least 32 characters) in backend/.env."
            )

        if not self.admin_user:
            raise RuntimeError(
                "ADMIN_USER must be set in backend/.env."
            )

        # Prefer ADMIN_PASS_HASH
        if self.admin_pass_hash:
            if not self.admin_pass_hash.startswith(
                ("$2a$", "$2b$", "$2y$")
            ):
                raise RuntimeError(
                    "ADMIN_PASS_HASH must be a valid bcrypt hash."
                )

        # Temporary fallback to plaintext ADMIN_PASS
        elif (
            not self.admin_pass
            or self.admin_pass in insecure_admin_pass_values
            or len(self.admin_pass) < 12
        ):
            raise RuntimeError(
                "Set ADMIN_PASS_HASH or a strong ADMIN_PASS "
                "(at least 12 characters) in backend/.env."
            )


settings = Settings()