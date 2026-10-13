import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError
from app.core.paths import AUDIT_UPLOAD_DIR, FEEDBACK_UPLOAD_DIR


MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
CHUNK_SIZE = 64 * 1024             # 64 KB
MAX_UPLOAD_FILES = 5

def safe_join(base_dir: Path, filename: str) -> Path:
    return base_dir / os.path.basename(filename)


def detect_image_type(header: bytes) -> str | None:
    # JPEG
    if header.startswith(b"\xff\xd8\xff"):
        return "jpeg"

    # PNG
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"

    # WebP
    if (
        len(header) >= 12
        and header[:4] == b"RIFF"
        and header[8:12] == b"WEBP"
    ):
        return "webp"

    # HEIC / HEIF
    if (
        len(header) >= 12
        and header[4:8] == b"ftyp"
        and header[8:12] in {
            b"heic",
            b"heix",
            b"hevc",
            b"hevx",
            b"mif1",
            b"msf1",
        }
    ):
        return "heic"

    return None


async def save_uploads(
    files: Optional[list[UploadFile]],
    target_dir: Path,
) -> list:
    if not files:
        return []

    if len(files) > MAX_UPLOAD_FILES:
        raise HTTPException(
            status_code=413,
            detail="Too many images. Maximum is 5 images per submission.",
        )

    saved = []

    for upload in files:
        path = None

        try:
            if not upload:
                continue

            content_type = (upload.content_type or "").lower()

            if not content_type.startswith("image/"):
                raise HTTPException(
                    status_code=415,
                    detail="Only image uploads are allowed.",
                )

            first_chunk = await upload.read(CHUNK_SIZE)

            if not first_chunk:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded image is empty.",
                )

            detected_type = detect_image_type(first_chunk)

            if detected_type is None:
                raise HTTPException(
                    status_code=415,
                    detail="Invalid or unsupported image file.",
                )

            extensions = {
                "jpeg": ".jpg",
                "png": ".png",
                "webp": ".webp",
                "heic": ".heic",
            }

            ext = extensions[detected_type]

            name = (
                f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}{ext}"
            )

            path = safe_join(target_dir, name)

            size = len(first_chunk)

            with open(path, "wb") as output:
                output.write(first_chunk)

                while True:
                    chunk = await upload.read(CHUNK_SIZE)

                    if not chunk:
                        break

                    size += len(chunk)

                    if size > MAX_UPLOAD_SIZE:
                        output.close()

                        if path.exists():
                            path.unlink()

                        raise HTTPException(
                            status_code=413,
                            detail=(
                                "Image is too large. "
                                "Maximum size is 5 MB."
                            ),
                        )

                    output.write(chunk)
            if detected_type != "heic":
                try:
                    with Image.open(path) as image:
                        image.verify()

                except (UnidentifiedImageError, OSError, ValueError):
                    if path.exists():
                        path.unlink()

                    raise HTTPException(
                        status_code=415,
                        detail="Invalid or corrupted image file.",
                    )

            saved.append(
                {
                    "filename": name,
                    "content_type": upload.content_type,
                    "path": str(path),
                }
            )

        except HTTPException:
            if path is not None and path.exists():
                path.unlink()

            raise

        except Exception:
            if path is not None and path.exists():
                path.unlink()

            raise HTTPException(
                status_code=500,
                detail="Failed to save uploaded image.",
            )

    return saved


def resolve_upload_response(kind: str, filename: str) -> FileResponse:
    if kind not in ["feedback", "audit"]:
        raise HTTPException(
            status_code=404,
            detail="Not found",
        )

    base_dir = (
        FEEDBACK_UPLOAD_DIR
        if kind == "feedback"
        else AUDIT_UPLOAD_DIR
    )

    path = safe_join(base_dir, filename)

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Not found",
        )

    return FileResponse(path)