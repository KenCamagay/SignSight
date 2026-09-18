import Foundation
import CoreMedia
import UIKit
import MediaPipeTasksVision

@objcMembers
public final class SignSightHandTrackingController: NSObject,
  HandLandmarkerLiveStreamDelegate,
  PoseLandmarkerLiveStreamDelegate {

  private struct HandCandidate {
    let landmarks: [[String: Double]]
    let handedness: String
    let score: Double
    let area: Double
  }

  private struct HandSnapshot {
    let hands: [HandCandidate]
    let timestampMs: Int
    let sequenceId: Int
  }

  private var handLandmarker: HandLandmarker?
  private var poseLandmarker: PoseLandmarker?

  private let processLock = NSLock()
  private var lastProcessTimestampMs: Int = 0

  private let resultLock = NSLock()
  private var latestHandSnapshot: HandSnapshot?

  public override init() {
    super.init()

    do {
      let handModelPath = try Self.modelPath(
        name: "hand_landmarker",
        extension: "task"
      )

      let poseModelPath = try Self.modelPath(
        name: "pose_landmarker_full",
        extension: "task"
      )

      let handBaseOptions = BaseOptions()
      handBaseOptions.modelAssetPath = handModelPath
      handBaseOptions.delegate = .CPU

      let handOptions = HandLandmarkerOptions()
      handOptions.baseOptions = handBaseOptions
      handOptions.runningMode = .liveStream
      handOptions.numHands = 2
      handOptions.minHandDetectionConfidence = 0.45
      handOptions.minHandPresenceConfidence = 0.45
      handOptions.minTrackingConfidence = 0.45
      handOptions.handLandmarkerLiveStreamDelegate = self

      handLandmarker = try HandLandmarker(options: handOptions)

      let poseBaseOptions = BaseOptions()
      poseBaseOptions.modelAssetPath = poseModelPath
      poseBaseOptions.delegate = .CPU

      let poseOptions = PoseLandmarkerOptions()
      poseOptions.baseOptions = poseBaseOptions
      poseOptions.runningMode = .liveStream
      poseOptions.numPoses = 1
      poseOptions.minPoseDetectionConfidence = 0.30
      poseOptions.minPosePresenceConfidence = 0.30
      poseOptions.minTrackingConfidence = 0.30
      poseOptions.shouldOutputSegmentationMasks = false
      poseOptions.poseLandmarkerLiveStreamDelegate = self

      poseLandmarker = try PoseLandmarker(options: poseOptions)


    } catch {
      NSLog("[SignSight] MediaPipe initialization failed: \(error)")
    }
  }

  public func processFrame(
    _ sampleBuffer: CMSampleBuffer,
    orientation: UIImage.Orientation,
    minProcessIntervalMs: Int,
    runPoseLandmarker: Bool
  ) {
    guard handLandmarker != nil else {
      return
    }

    let nowMs = Int(ProcessInfo.processInfo.systemUptime * 1000.0)

    processLock.lock()

    if nowMs - lastProcessTimestampMs < minProcessIntervalMs {
      processLock.unlock()
      return
    }

    let timestampMs = max(nowMs, lastProcessTimestampMs + 1)
    lastProcessTimestampMs = timestampMs

    processLock.unlock()

    do {
      let image = try MPImage(
        sampleBuffer: sampleBuffer,
        orientation: orientation
      )

      try handLandmarker?.detectAsync(
        image: image,
        timestampInMilliseconds: timestampMs
      )

      if runPoseLandmarker {
        let poseImage = try MPImage(
          sampleBuffer: sampleBuffer,
          orientation: orientation
        )

        try poseLandmarker?.detectAsync(
          image: poseImage,
          timestampInMilliseconds: timestampMs
        )
      }
    } catch {
      NSLog("[SignSight] Frame processing failed: \(error)")
    }
  }

  public func latestResult(
    maxResultAgeMs: Int
  ) -> NSDictionary? {
    let nowMs = Int(ProcessInfo.processInfo.systemUptime * 1000.0)

    resultLock.lock()
    let handSnapshot = latestHandSnapshot
    resultLock.unlock()

    guard let handSnapshot else {
      return nil
    }

    let handFresh =
      nowMs - handSnapshot.timestampMs <= maxResultAgeMs

    guard handFresh else {
      return [
        "landmarks": NSNull(),
        "handedness": NSNull(),
        "hands": NSNull(),
        "upperBody": NSNull(),
        "hasUpperBody": false,
        "upperBodyCount": 0,
        "timestampMs": Double(handSnapshot.timestampMs),
        "hasHand": false,
        "sequenceId": Double(handSnapshot.sequenceId)
      ]
    }

    let primary = handSnapshot.hands.max { lhs, rhs in
      if lhs.score == rhs.score {
        return lhs.area < rhs.area
      }

      return lhs.score < rhs.score
    }

    let hands: [[String: Any]] = handSnapshot.hands.map { hand in
      [
        "landmarks": hand.landmarks,
        "handedness": hand.handedness,
        "score": hand.score,
        "area": hand.area
      ]
    }

    return [
      "landmarks": primary?.landmarks ?? [],
      "handedness": primary?.handedness ?? "",
      "hands": hands,
      "upperBody": NSNull(),
      "hasUpperBody": false,
      "upperBodyCount": 0,
      "timestampMs": Double(handSnapshot.timestampMs),
      "hasHand": primary != nil,
      "sequenceId": Double(handSnapshot.sequenceId)
    ]
  }

  public func handLandmarker(
    _ handLandmarker: HandLandmarker,
    didFinishDetection result: HandLandmarkerResult?,
    timestampInMilliseconds: Int,
    error: Error?
  ) {
    if let error {
      NSLog("[SignSight] HandLandmarker error: \(error)")
      return
    }

    guard let result else {
      return
    }

    var candidates: [HandCandidate] = []

    for index in result.landmarks.indices {
      let sourceLandmarks = result.landmarks[index]

      let category =
        index < result.handedness.count
          ? result.handedness[index].first
          : nil

      let handedness = category?.categoryName ?? ""
      let score = Double(category?.score ?? 0)

      let area = Self.estimateHandArea(
        landmarks: sourceLandmarks
      )

      candidates.append(
        HandCandidate(
          landmarks: landmarks,
          handedness: handedness,
          score: score,
          area: area
        )
      )
    }

    let snapshot = HandSnapshot(
      hands: candidates,
      timestampMs: timestampInMilliseconds,
      sequenceId: timestampInMilliseconds
    )

    resultLock.lock()
    latestHandSnapshot = snapshot
    resultLock.unlock()
  }

  public func poseLandmarker(
    _ poseLandmarker: PoseLandmarker,
    didFinishDetection result: PoseLandmarkerResult?,
    timestampInMilliseconds: Int,
    error: Error?
  ) {
    if let error {
      NSLog("[SignSight] PoseLandmarker error: \(error)")
    }
  }

  private static func estimateHandArea(
    landmarks: [NormalizedLandmark]
  ) -> Double {
    guard let first = landmarks.first else {
      return 0
    }

    var minX = Double(first.x)
    var maxX = Double(first.x)
    var minY = Double(first.y)
    var maxY = Double(first.y)

    for landmark in landmarks.dropFirst() {
      let x = Double(landmark.x)
      let y = Double(landmark.y)

      minX = min(minX, x)
      maxX = max(maxX, x)
      minY = min(minY, y)
      maxY = max(maxY, y)
    }

    return max(0, maxX - minX) * max(0, maxY - minY)
  }

  private static func modelPath(
    name: String,
    extension fileExtension: String
  ) throws -> String {
    let candidates = [
      Bundle.main,
      Bundle(for: SignSightHandTrackingController.self)
    ]

    for hostBundle in candidates {
      if let resourceBundleURL = hostBundle.url(
        forResource: "SignSightHandTracker",
        withExtension: "bundle"
      ),
      let resourceBundle = Bundle(url: resourceBundleURL),
      let path = resourceBundle.path(
        forResource: name,
        ofType: fileExtension
      ) {
        return path
      }

      if let path = hostBundle.path(
        forResource: name,
        ofType: fileExtension
      ) {
        return path
      }
    }

    throw NSError(
      domain: "SignSightHandTracker",
      code: 1,
      userInfo: [
        NSLocalizedDescriptionKey:
          "Could not locate \(name).\(fileExtension)"
      ]
    )
  }
}
