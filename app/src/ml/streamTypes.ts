import type {
  DetectedHand,
  HandPoint,
  HandTrackingFrameResult,
  Handedness,
  UpperBodyEntry,
  UpperBodyKeypointName,
  UpperBodyLandmarks,
} from "../../modules/signsight-hand-tracker";

export type {
  DetectedHand,
  HandPoint,
  HandTrackingFrameResult,
  Handedness,
  UpperBodyEntry,
  UpperBodyKeypointName,
  UpperBodyLandmarks,
};

export type DetectMode = "LETTERS" | "WORDS";

export type LandmarkSampleFrame = {
  landmarks: HandPoint[];
};

export type GestureV2SampleFrame = {
  hands: Array<{
    landmarks: HandPoint[];
    handedness: Handedness | null;
  }>;
  handedness: Handedness | null;
  timestampMs: number;
};

export type StreamingRecognitionBuffers = {
  letterMotionFrames: LandmarkSampleFrame[];
  recordingFrames: LandmarkSampleFrame[];
  liveWordFrames: LandmarkSampleFrame[];
  gestureV2RecordingFrames: GestureV2SampleFrame[];
  gestureV2LiveFrames: GestureV2SampleFrame[];
  lastLetterMotionAtMs: number;
  lastWordPredictionAtMs: number;
  lastWordLandmarkAtMs: number;
  lastWordHandAtMs: number;
  wordNoHandSinceMs: number;
  wordMissCount: number;
  sentenceTokens: string[];
  sentenceNoHandSinceMs: number;
};
