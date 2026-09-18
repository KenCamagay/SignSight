#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import "SignSightHandTracker-Swift.h"

@interface SignSightHandTrackerFrameProcessorPlugin : FrameProcessorPlugin

@property(nonatomic, strong) SignSightHandTrackingController *trackingController;

@end

@implementation SignSightHandTrackerFrameProcessorPlugin

- (instancetype)initWithProxy:(VisionCameraProxyHolder *)proxy
                   withOptions:(NSDictionary *)options
{
  self = [super initWithProxy:proxy withOptions:options];

  if (self) {
    _trackingController = [[SignSightHandTrackingController alloc] init];
  }

  return self;
}

- (id)callback:(Frame *)frame
 withArguments:(NSDictionary *)arguments
{
  if (!frame.isValid) {
    return nil;
  }

  NSNumber *intervalValue = arguments[@"minProcessIntervalMs"];
  NSInteger minProcessIntervalMs =
      intervalValue != nil ? intervalValue.integerValue : 30;

  NSNumber *runPoseValue = arguments[@"runPoseLandmarker"];
  BOOL runPoseLandmarker =
      runPoseValue != nil ? runPoseValue.boolValue : YES;

  [self.trackingController
      processFrame:frame.buffer
      orientation:frame.orientation
      minProcessIntervalMs:minProcessIntervalMs
      runPoseLandmarker:runPoseLandmarker];

  NSNumber *maxAgeValue = arguments[@"maxResultAgeMs"];
  NSInteger maxResultAgeMs =
      maxAgeValue != nil ? maxAgeValue.integerValue : 500;

  return [self.trackingController
      latestResultWithMaxResultAgeMs:maxResultAgeMs];
}

VISION_EXPORT_FRAME_PROCESSOR(
  SignSightHandTrackerFrameProcessorPlugin,
  signsightDetectHands
)

@end
