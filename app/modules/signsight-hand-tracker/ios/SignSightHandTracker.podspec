Pod::Spec.new do |s|
  s.name           = 'SignSightHandTracker'
  s.version        = '1.0.0'
  s.summary        = 'Native hand and upper-body tracking for SignSight'
  s.description    = 'Cross-platform SignSight native module providing VisionCamera frame processing with MediaPipe hand and pose tracking.'
  s.author         = 'SignSight'
  s.homepage       = 'https://github.com/KenCamagay/SignSight'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = {
    :git => 'https://github.com/KenCamagay/SignSight.git',
    :tag => s.version.to_s
  }

  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'VisionCamera'
  s.dependency 'MediaPipeTasksVision', '0.10.35'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'

  s.resource_bundles = {
    'SignSightHandTracker' => [
      'Resources/*.task'
    ]
  }
end
