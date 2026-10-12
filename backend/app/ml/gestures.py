import numpy as np

from app.core.constants import GESTURE_FRAMES
from app.ml.landmarks import normalize_landmarks

GESTURE_HAND_SLOTS = 2
GESTURE_HAND_FEATURES = 63


def resample_frames(frames, target_len=GESTURE_FRAMES):
    if len(frames) == 0:
        return []
    idxs = np.linspace(0, len(frames) - 1, target_len).astype(int)
    return [frames[i] for i in idxs]


def gesture_to_vec(frames: list, handedness: str | None) -> np.ndarray:
    frames = resample_frames(frames, GESTURE_FRAMES)
    vecs = []
    for landmarks in frames:
        vecs.append(normalize_landmarks(landmarks, handedness))

    if len(vecs) != GESTURE_FRAMES:
        return np.zeros((GESTURE_FRAMES * 63,), dtype=np.float32)

    return np.concatenate(vecs).astype(np.float32)


def gesture_v2_frame_to_vec(frame: dict) -> np.ndarray:
    hands = frame.get("hands")
    if not isinstance(hands, list):
        return np.zeros((GESTURE_HAND_SLOTS * GESTURE_HAND_FEATURES,), dtype=np.float32)

    ordered: list[dict] = []
    for handedness in ("Left", "Right"):
        ordered.extend(
            hand for hand in hands
            if isinstance(hand, dict) and hand.get("handedness") == handedness
        )
    ordered.extend(
        hand for hand in hands
        if isinstance(hand, dict) and hand not in ordered
    )

    vectors = []
    for hand in ordered[:GESTURE_HAND_SLOTS]:
        landmarks = hand.get("landmarks")
        handedness = hand.get("handedness")
        if isinstance(landmarks, list) and len(landmarks) == 21:
            vectors.append(normalize_landmarks(landmarks, handedness))

    while len(vectors) < GESTURE_HAND_SLOTS:
        vectors.append(np.zeros((GESTURE_HAND_FEATURES,), dtype=np.float32))

    return np.concatenate(vectors).astype(np.float32)


def gesture_v2_to_vec(frames_v2: list) -> np.ndarray:
    frames = resample_frames(frames_v2, GESTURE_FRAMES)
    vecs = [gesture_v2_frame_to_vec(frame) for frame in frames if isinstance(frame, dict)]

    expected_frame_dims = GESTURE_HAND_SLOTS * GESTURE_HAND_FEATURES
    if len(vecs) != GESTURE_FRAMES:
        return np.zeros((GESTURE_FRAMES * expected_frame_dims,), dtype=np.float32)

    return np.concatenate(vecs).astype(np.float32)
