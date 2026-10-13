from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    admin,
    feedback,
    gestures,
    health,
    landmarks,
    models,
    uploads,
)
from app.core.config import settings
from app.services.gesture_classifier import bootstrap_gesture_model
from app.services.landmark_classifier import bootstrap_landmark_model


def create_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = (
            "strict-origin-when-cross-origin"
        )
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers[
            "X-Permitted-Cross-Domain-Policies"
        ] = "none"

        if request.url.path.startswith("/admin"):
            response.headers["Cache-Control"] = "no-store"

        return response

    app.include_router(uploads.router)
    app.include_router(landmarks.router)
    app.include_router(gestures.router)
    app.include_router(health.router)
    app.include_router(models.router)
    app.include_router(feedback.router)
    app.include_router(admin.router)

    @app.on_event("startup")
    async def on_startup() -> None:
        bootstrap_landmark_model()
        bootstrap_gesture_model()

    return app


app = create_app()