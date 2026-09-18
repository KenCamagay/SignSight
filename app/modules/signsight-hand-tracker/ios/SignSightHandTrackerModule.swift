import ExpoModulesCore

public class SignSightHandTrackerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SignSightHandTracker")

    Function("getPluginName") {
      "signsightDetectHands"
    }

    Function("isSupported") {
      true
    }

    Function("getTrackingCapabilities") {
      [
        "hands": true,
        "upperBody": true,
        "gestureV2": false
      ]
    }
  }
}
