"use client";

import { useEffect, useMemo, useState } from "react";

type Point = [number, number];

type Demo = {
  id: "a" | "hello" | "thanks";
  label: string;
  result: string;
  mode: string;
  helper: string;
};

const demos: Demo[] = [
  {
    id: "a",
    label: "A",
    result: "A",
    mode: "Letter Mode",
    helper: "Single-letter recognition",
  },
  {
    id: "hello",
    label: "HELLO",
    result: "Hello",
    mode: "Word Mode",
    helper: "Dynamic gesture recognition",
  },
  {
    id: "thanks",
    label: "THANK YOU",
    result: "Thank you",
    mode: "Word Mode",
    helper: "Dynamic gesture recognition",
  },
];

const features = [
  {
    icon: "/icons/feature-translate.png",
    title: "Live Translation",
    description:
      "Point your camera at a supported FSL sign and see the detected letter or word on screen.",
  },
  {
    icon: "/icons/feature-landmark.png",
    title: "Hand Landmark Tracking",
    description:
      "Tracks hand landmarks in real time to help recognize gestures quickly.",
  },
  {
    icon: "/icons/feature-tutorial.png",
    title: "FSL Fingerspelling Tutorial",
    description:
      "Learn and review Filipino Sign Language fingerspelling inside the app.",
  },
  {
    icon: "/icons/feature-tips.png",
    title: "Recognition Tips",
    description:
      "Simple tips for hand placement, framing, and lighting for better recognition.",
  },
];

const handConnections = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
] as const;

// Static demo pose for the letter A.
const aPose: Point[] = [
  [50, 84], [38, 72], [31, 61], [28, 51], [35, 48],
  [43, 62], [42, 51], [43, 46], [47, 48],
  [51, 60], [51, 48], [52, 43], [56, 47],
  [59, 62], [60, 51], [61, 47], [65, 51],
  [67, 67], [69, 58], [70, 55], [73, 59],
];

const helloFrames: Point[][] = [
  [[61.49, 30.81], [52.48, 32.43], [42.43, 31.82], [35.91, 29.77], [32.66, 27.65], [37.31, 26.61], [29.94, 23.89], [25.98, 22.02], [22.59, 20.3], [40.38, 24.83], [31.78, 21.7], [26.88, 19.67], [22.6, 17.71], [44.84, 23.6], [36.64, 20.76], [31.98, 18.86], [27.9, 17.22], [50.94, 22.77], [44.43, 20.53], [40.37, 19.37], [36.85, 18.32]],
  [[62.58, 30.84], [53.56, 32.47], [43.18, 31.79], [36.53, 29.74], [33.14, 27.57], [38.3, 26.35], [30.96, 23.59], [27.08, 21.6], [23.61, 19.77], [41.36, 24.57], [32.75, 21.51], [27.72, 19.45], [23.39, 17.45], [45.84, 23.31], [37.9, 20.39], [33.1, 18.72], [28.84, 17.14], [51.78, 22.51], [45.32, 20.32], [41.15, 19.2], [37.02, 18.23]],
  [[67.23, 30.23], [57.6, 31.61], [47.08, 30.77], [40.68, 28.5], [38.07, 25.87], [43.36, 25.16], [36.1, 22.29], [32.43, 20.41], [29.16, 18.66], [46.75, 23.32], [38.62, 19.86], [33.78, 17.75], [29.54, 15.74], [51.65, 22.03], [43.73, 19.05], [38.97, 17.22], [34.6, 15.61], [57.83, 21.36], [51.97, 19.12], [47.91, 17.84], [44.03, 16.66]],
  [[71.11, 28.71], [61.13, 30.17], [51.34, 29.32], [44.91, 26.98], [42.56, 24.43], [48.21, 23.37], [41.14, 20.26], [37.77, 18.15], [35.08, 16.17], [51.97, 21.69], [44.23, 18.07], [39.59, 15.79], [35.81, 13.57], [57.11, 20.51], [49.91, 17.34], [45.52, 15.11], [41.27, 13.33], [64.22, 20.04], [58.6, 17.58], [54.43, 16.16], [50.7, 15.0]],
  [[71.24, 28.69], [61.39, 29.99], [51.72, 29.05], [45.56, 26.7], [43.05, 24.11], [48.56, 23.14], [42.02, 19.9], [38.34, 17.69], [35.38, 15.64], [52.82, 21.5], [45.64, 17.74], [41.31, 15.31], [37.61, 13.08], [58.05, 20.44], [51.46, 17.13], [47.07, 14.88], [43.38, 12.99], [64.84, 20.01], [59.67, 17.28], [55.44, 15.86], [51.81, 14.67]],
  [[72.69, 28.33], [62.62, 29.61], [52.86, 28.51], [46.62, 25.99], [44.18, 23.4], [50.3, 22.75], [43.74, 19.38], [40.21, 17.2], [37.32, 15.23], [54.36, 21.01], [47.15, 17.05], [42.57, 14.63], [38.81, 12.38], [59.6, 19.96], [53.16, 16.44], [48.65, 14.12], [45.01, 12.12], [66.31, 19.72], [61.36, 16.82], [57.35, 15.22], [53.78, 13.91]],
  [[77.41, 27.47], [66.07, 28.93], [57.09, 28.09], [51.16, 25.61], [48.08, 22.66], [55.5, 22.16], [49.28, 18.39], [45.97, 15.89], [43.45, 13.84], [60.11, 20.7], [53.28, 16.49], [49.32, 13.5], [46.35, 11.0], [65.49, 19.81], [59.91, 15.87], [55.69, 13.32], [52.37, 11.1], [71.75, 19.43], [67.82, 16.32], [64.52, 14.33], [61.67, 12.79]],
  [[76.44, 27.89], [65.99, 28.95], [56.94, 27.92], [51.16, 25.49], [48.51, 22.54], [55.39, 22.11], [49.47, 18.39], [46.23, 16.02], [43.76, 13.94], [59.99, 20.64], [53.61, 16.47], [49.53, 13.59], [46.22, 11.07], [65.52, 19.84], [60.15, 15.96], [55.85, 13.29], [52.21, 11.07], [71.98, 19.66], [68.06, 16.34], [64.59, 14.44], [61.52, 12.97]],
  [[77.17, 27.78], [66.52, 28.98], [57.51, 28.04], [51.58, 25.51], [48.86, 22.57], [56.11, 22.16], [50.05, 18.42], [46.67, 16.03], [44.05, 13.95], [60.67, 20.7], [54.11, 16.53], [49.81, 13.66], [46.5, 11.12], [66.26, 19.87], [60.81, 15.97], [56.16, 13.34], [52.56, 11.07], [72.84, 19.8], [68.49, 16.49], [64.85, 14.62], [61.79, 13.12]],
  [[76.13, 27.67], [65.56, 28.85], [56.96, 27.9], [51.42, 25.5], [48.32, 22.6], [55.38, 22.11], [49.29, 18.33], [45.95, 15.91], [43.45, 13.87], [60.06, 20.6], [53.42, 16.5], [49.36, 13.62], [45.96, 11.13], [65.55, 19.76], [59.85, 16.09], [55.61, 13.39], [51.84, 11.24], [72.13, 19.55], [67.86, 16.34], [64.28, 14.46], [60.96, 13.1]],
  [[76.36, 27.46], [65.76, 28.73], [56.83, 27.84], [51.11, 25.4], [48.33, 22.36], [55.34, 22.09], [49.36, 18.32], [45.87, 15.95], [43.19, 13.91], [59.88, 20.63], [53.28, 16.46], [49.01, 13.55], [45.62, 11.07], [65.44, 19.65], [59.81, 15.89], [55.3, 13.26], [51.51, 11.02], [71.71, 19.48], [67.63, 16.27], [64.05, 14.39], [60.86, 13.02]],
  [[68.42, 68.16], [50.33, 68.64], [36.92, 73.88], [32.14, 79.5], [33.04, 83.91], [37.46, 75.08], [31.4, 82.77], [29.78, 86.37], [29.01, 88.61], [45.88, 76.82], [40.99, 84.26], [39.32, 87.26], [38.9, 88.81], [54.6, 78.38], [49.64, 84.84], [48.16, 87.47], [48.17, 88.62], [62.14, 79.57], [57.77, 84.48], [56.17, 87.58], [56.36, 89.0]]
];

const thanksFrames: Point[][] = [
  [[51.2, 58.86], [58.96, 51.58], [61.23, 44.31], [56.87, 39.52], [49.4, 37.6], [48.99, 40.64], [39.65, 32.23], [33.53, 27.76], [28.65, 24.4], [39.58, 42.41], [29.81, 32.96], [23.24, 27.66], [18.2, 23.4], [31.43, 45.06], [23.23, 36.19], [17.87, 31.09], [14.4, 27.14], [23.62, 48.13], [17.9, 41.41], [14.73, 37.31], [11.68, 33.78]],
  [[52.21, 61.72], [60.77, 54.04], [63.21, 46.61], [59.31, 41.55], [51.25, 39.78], [50.18, 43.39], [39.7, 34.74], [33.71, 29.93], [28.74, 26.34], [40.85, 45.2], [29.79, 35.35], [22.82, 29.84], [16.87, 25.41], [32.0, 48.06], [22.89, 38.69], [17.5, 33.5], [13.63, 29.38], [23.71, 51.13], [17.51, 44.36], [14.0, 40.08], [11.0, 36.78]],
  [[61.36, 64.83], [71.64, 57.78], [74.78, 49.82], [72.5, 43.48], [67.2, 39.78], [57.81, 45.43], [48.39, 36.57], [42.49, 31.54], [37.01, 27.71], [47.71, 47.0], [37.86, 37.09], [31.19, 30.99], [25.42, 26.19], [38.65, 49.79], [30.22, 40.59], [25.08, 34.91], [21.43, 30.75], [30.55, 53.34], [23.95, 46.11], [20.87, 41.7], [18.48, 37.95]],
  [[71.48, 69.66], [81.6, 60.88], [84.28, 51.13], [78.99, 43.47], [70.15, 39.01], [68.87, 49.15], [59.5, 39.89], [53.78, 34.83], [49.23, 31.47], [58.24, 51.02], [49.37, 40.61], [43.04, 34.49], [37.96, 29.69], [48.38, 54.14], [41.0, 44.16], [35.88, 38.2], [32.52, 33.87], [39.78, 57.56], [33.75, 50.11], [31.2, 45.46], [28.65, 41.74]],
  [[76.96, 74.54], [84.89, 64.96], [86.41, 54.84], [81.01, 46.75], [73.89, 41.3], [75.37, 54.39], [65.34, 44.85], [59.2, 39.58], [54.56, 35.85], [64.96, 56.85], [54.98, 46.17], [48.32, 39.84], [43.31, 34.99], [54.58, 60.32], [45.81, 50.14], [41.37, 43.95], [38.21, 39.35], [45.41, 64.11], [38.84, 56.24], [35.22, 51.27], [32.6, 47.28]],
  [[75.81, 75.15], [84.67, 66.34], [86.47, 56.73], [80.57, 48.83], [73.86, 43.77], [76.25, 55.44], [66.28, 45.66], [59.94, 40.2], [55.23, 36.4], [64.88, 57.64], [55.76, 46.85], [49.86, 40.59], [44.95, 35.64], [54.61, 60.82], [46.72, 50.92], [41.77, 44.82], [38.72, 40.13], [45.39, 64.47], [39.32, 56.79], [35.93, 51.99], [33.02, 48.03]],
  [[75.81, 75.53], [84.85, 66.52], [86.3, 56.78], [80.85, 48.74], [73.89, 43.43], [77.28, 56.4], [67.4, 46.48], [61.3, 41.02], [56.9, 37.06], [65.83, 58.67], [56.89, 47.77], [51.1, 41.41], [46.51, 36.4], [55.64, 61.81], [47.89, 51.72], [42.76, 45.65], [40.12, 40.86], [46.35, 65.45], [40.37, 57.73], [37.02, 52.9], [34.3, 48.89]],
  [[76.88, 75.84], [85.36, 66.87], [86.52, 57.15], [81.35, 49.16], [74.45, 43.86], [78.29, 56.85], [68.38, 47.13], [62.26, 41.82], [58.13, 37.97], [67.39, 59.18], [58.44, 48.42], [52.31, 42.16], [47.9, 37.33], [56.98, 62.31], [49.15, 52.27], [44.29, 46.32], [41.33, 41.74], [47.09, 65.96], [41.51, 58.19], [37.98, 53.19], [35.49, 49.16]],
  [[77.16, 76.5], [86.03, 68.1], [87.18, 58.98], [82.66, 52.07], [76.56, 47.83], [79.44, 57.68], [70.16, 47.8], [64.34, 42.3], [59.39, 38.47], [68.02, 59.83], [58.96, 48.81], [53.07, 42.54], [48.75, 37.58], [57.69, 62.84], [49.81, 52.8], [44.85, 46.83], [42.24, 42.09], [48.08, 66.33], [42.15, 58.79], [38.79, 53.96], [36.39, 49.88]],
  [[77.39, 76.6], [86.39, 68.1], [87.41, 58.94], [82.62, 51.93], [77.18, 47.65], [80.07, 57.73], [71.59, 47.78], [65.71, 42.24], [60.73, 38.35], [68.93, 59.92], [60.11, 48.76], [54.14, 42.35], [49.59, 37.35], [58.48, 62.88], [50.81, 52.71], [45.76, 46.62], [42.91, 41.96], [48.7, 66.4], [42.86, 58.66], [39.56, 53.71], [37.09, 49.62]],
  [[77.45, 76.06], [86.14, 67.4], [86.87, 58.08], [81.49, 51.01], [75.31, 46.51], [80.74, 57.34], [72.02, 47.39], [65.59, 41.91], [60.72, 38.02], [69.93, 59.61], [60.52, 48.36], [54.24, 42.02], [50.0, 37.0], [58.89, 62.36], [50.67, 52.18], [46.06, 46.11], [43.24, 41.4], [48.95, 65.81], [42.65, 57.9], [39.28, 53.01], [36.97, 48.99]],
  [[80.62, 76.41], [87.95, 68.28], [89.0, 59.68], [85.14, 53.39], [80.42, 49.99], [83.73, 57.97], [76.04, 48.32], [69.09, 42.89], [63.62, 39.06], [73.29, 60.54], [63.72, 49.42], [56.87, 43.07], [51.64, 38.23], [62.83, 63.66], [54.25, 53.68], [49.2, 47.71], [46.14, 43.23], [52.94, 67.27], [46.56, 59.63], [43.04, 54.88], [40.92, 50.82]]
];

const gestureFrames: Record<Demo["id"], Point[][]> = {
  a: [aPose],
  hello: helloFrames,
  thanks: thanksFrames,
};

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}


function FaceGuide() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* Head */}
      <ellipse
        cx="50"
        cy="38"
        rx="17"
        ry="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        className="text-white/20"
      />

      {/* Ears */}
      <path
        d="M33 36 C29.5 35 29.5 43 33.5 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-white/15"
      />
      <path
        d="M67 36 C70.5 35 70.5 43 66.5 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-white/15"
      />

      {/* Eyes */}
      <path
        d="M41 36 Q44 34.5 47 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        className="text-white/16"
      />
      <path
        d="M53 36 Q56 34.5 59 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        className="text-white/16"
      />

      {/* Nose */}
      <path
        d="M50 37 L48.5 44 Q50 45 52 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        className="text-white/13"
      />

      {/* Mouth */}
      <path
        d="M45 49 Q50 51 55 49"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        className="text-white/18"
      />

      {/* Neck */}
      <path
        d="M43 58 L42 67 M57 58 L58 67"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        className="text-white/16"
      />

      {/* Shoulders */}
      <path
        d="M42 66 Q28 68 19 80 M58 66 Q72 68 81 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        className="text-white/16"
      />

      {/* Chin reference */}
      <circle
        cx="50"
        cy="57"
        r="1.2"
        className="fill-white/20"
      />
    </svg>
  );
}

function AnimatedHand({
  pose,
  detecting = false,
}: {
  pose: Point[];
  detecting?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      role="img"
      aria-label="Animated 21-point hand landmark preview"
    >
      {handConnections.map(([start, end]) => {
        const [x1, y1] = pose[start];
        const [x2, y2] = pose[end];

        return (
          <line
            key={`${start}-${end}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="landmark-line"
          />
        );
      })}

      {pose.map(([x, y], index) => (
        <g key={index}>
          <circle
            cx={x}
            cy={y}
            r={index === 0 ? 3.8 : 3}
            className="landmark-point-glow"
          />
          <circle
            cx={x}
            cy={y}
            r={index === 0 ? 2.1 : 1.65}
            className="landmark-point"
          />
        </g>
      ))}

      {detecting && (
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          className="landmark-ring"
        />
      )}
    </svg>
  );
}

export default function SignSightDownloadPage() {
  const [activeDemo, setActiveDemo] = useState<Demo>(demos[1]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  const frames = useMemo(
    () => gestureFrames[activeDemo.id] ?? [aPose],
    [activeDemo.id],
  );

  const isDynamic = frames.length > 1;
  const currentPose = frames[Math.min(frameIndex, frames.length - 1)];

  useEffect(() => {
    setFrameIndex(0);
    setCycle(0);

    if (frames.length <= 1) return;

    const frameDuration = 95;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= frames.length - 1) {
          setCycle((value) => value + 1);
          return 0;
        }
        return current + 1;
      });
    }, frameDuration);

    return () => window.clearInterval(timer);
  }, [activeDemo.id, frames]);

  const progress = isDynamic
    ? ((frameIndex + 1) / frames.length) * 100
    : 100;

  const status = !isDynamic
    ? "DETECTED"
    : frameIndex < Math.ceil(frames.length * 0.22)
      ? "TRACKING"
      : frameIndex < frames.length - 2
        ? "DETECTING"
        : "DETECTED";

  const selectDemo = (demo: Demo) => {
    setActiveDemo(demo);
    setFrameIndex(0);
    setCycle(0);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFAF6] text-[#202124]">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .landmark-line {
          stroke: #f67a16;
          stroke-width: 1.5;
          stroke-linecap: round;
          opacity: 0.68;
          transition:
            x1 90ms linear,
            y1 90ms linear,
            x2 90ms linear,
            y2 90ms linear;
        }

        .landmark-point {
          fill: #f67a16;
          stroke: #fffaf6;
          stroke-width: 0.65;
          transition:
            cx 90ms linear,
            cy 90ms linear;
        }

        .landmark-point-glow {
          fill: rgba(246, 122, 22, 0.14);
          transition:
            cx 90ms linear,
            cy 90ms linear;
        }

        @keyframes scan {
          0% {
            top: 8%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0;
          }
        }

        @keyframes landmarkPulse {
          0%,
          100% {
            opacity: 0.16;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes resultIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scan-line {
          animation: scan 1.35s linear infinite;
        }

        .landmark-ring {
          stroke: #f67a16;
          stroke-width: 0.6;
          stroke-dasharray: 3 4;
          transform-origin: center;
          animation: landmarkPulse 1.8s ease-in-out infinite;
        }

        .result-in {
          animation: resultIn 350ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .scan-line,
          .landmark-ring,
          .result-in {
            animation: none;
          }

          .landmark-line,
          .landmark-point,
          .landmark-point-glow {
            transition: none;
          }
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[#FFFAF6]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center px-6 md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <img
              src="/icons/logo.png"
              alt="SignSight"
              className="h-9 w-9 object-contain"
            />
            <span className="text-lg font-extrabold tracking-[-0.04em]">
              SignSight
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#experience" className="transition hover:text-[#F67A16]">
              Experience
            </a>
            <a href="#features" className="transition hover:text-[#F67A16]">
              Features
            </a>
            <a href="/plans" className="transition hover:text-[#F67A16]">
              Plans
            </a>
            <a href="#download" className="transition hover:text-[#F67A16]">
              Download
            </a>
          </nav>

          <a
            href="#download"
            className="ml-8 hidden rounded-full bg-[#202124] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#F67A16] md:inline-flex"
          >
            Get the app
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto grid h-10 w-10 place-items-center md:hidden"
            aria-label="Open menu"
          >
            <span className="text-2xl">{menuOpen ? "×" : "≡"}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-black/10 bg-[#FFFAF6] px-6 py-5 md:hidden">
            <div className="flex flex-col gap-4 font-semibold">
              <a href="#experience" onClick={() => setMenuOpen(false)}>
                Experience
              </a>
              <a href="#features" onClick={() => setMenuOpen(false)}>
                Features
              </a>
              <a href="/plans" onClick={() => setMenuOpen(false)}>
                Plans
              </a>
              <a href="#download" onClick={() => setMenuOpen(false)}>
                Download
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative min-h-screen overflow-hidden border-b border-black/10 px-6 pb-16 pt-32 md:px-8 md:pt-36">
          <div className="absolute -right-40 top-32 h-[450px] w-[450px] rounded-full bg-[#F67A16]/[0.06] blur-3xl" />

          <div className="relative mx-auto grid min-h-[calc(100vh-190px)] max-w-7xl items-center gap-16 lg:grid-cols-[1fr_.8fr]">
            <div>
              <div className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#C95D0A]">
                <span className="h-2 w-2 rounded-full bg-[#F67A16]" />
                Filipino Sign Language
              </div>

              <h1 className="max-w-4xl text-[clamp(4.2rem,8vw,7.8rem)] font-extrabold leading-[0.82] tracking-[-0.075em]">
                SIGN
                <span className="block text-[#F67A16]">SEEN.</span>
                <span className="block">WORDS</span>
                <span className="block">UNDERSTOOD.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base font-medium leading-7 text-black/55 md:text-lg">
                SignSight recognizes supported FSL signs through your phone
                camera and turns them into readable text.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="#download"
                  className="inline-flex items-center gap-3 rounded-full bg-[#F67A16] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E9650A]"
                >
                  <img
                    src="/icons/android.png"
                    alt=""
                    className="h-5 w-5 object-contain brightness-0 invert"
                  />
                  Download for Android
                </a>

                <a
                  href="#experience"
                  className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-black/25 underline-offset-4 transition hover:text-[#F67A16]"
                >
                  See how it works
                  <ArrowDown />
                </a>
              </div>
            </div>

            <div className="relative mx-auto">
              <div className="absolute left-1/2 top-1/2 h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F67A16]/10 sm:h-[440px] sm:w-[440px]" />

              <div className="relative w-[275px] rounded-[48px] border-[9px] border-[#202124] bg-[#202124] p-2 shadow-[0_28px_70px_rgba(32,33,36,.16)] sm:w-[315px]">
                <div className="absolute left-1/2 top-3 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-[#202124]" />

                <div className="relative aspect-[9/19.4] overflow-hidden rounded-[36px] bg-[#FFF8F3]">
                  <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-10">
                    <span className="text-[10px] font-black">SignSight</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-bold">
                      {status}
                    </span>
                  </div>

                  <div className="absolute inset-x-5 top-[19%] flex h-[53%] items-center justify-center overflow-hidden rounded-[26px] border border-[#F67A16]/30 bg-[#FFE9D8]">
                    <div className="absolute inset-4 rounded-[19px] border border-dashed border-[#F67A16]/35" />

                    {isDynamic && (
                      <div className="absolute inset-0 z-0">
                        <FaceGuide />
                      </div>
                    )}

                    <div className="relative z-10 h-[86%] w-[86%]">
                      <AnimatedHand
                        pose={currentPose}
                        detecting={status !== "DETECTED"}
                      />
                    </div>

                    {status === "DETECTING" && (
                      <div className="scan-line absolute inset-x-0 z-20 h-px bg-[#F67A16] shadow-[0_0_12px_rgba(246,122,22,.7)]" />
                    )}
                  </div>

                  <div className="absolute inset-x-5 bottom-5 rounded-[24px] bg-white p-5 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
                      Live recognition
                    </div>

                    <div className="mt-1 text-2xl font-black tracking-[-0.04em]">
                      {status === "TRACKING" && "Tracking..."}
                      {status === "DETECTING" && "Detecting..."}
                      {status === "DETECTED" && activeDemo.result}
                    </div>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[#F67A16] transition-[width] duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="experience"
          className="scroll-mt-20 px-6 py-24 md:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 max-w-2xl">
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#D95F05]">
                Try SignSight
              </div>

              <h2 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.055em] md:text-7xl">
                See how a sign
                <span className="text-[#F67A16]"> becomes text.</span>
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-black/55">
                Choose a sample sign and watch the 21 hand landmarks follow the
                recorded gesture sequence before SignSight presents the result.
              </p>
            </div>

            <div className="grid overflow-hidden rounded-[32px] border border-black/10 bg-white lg:grid-cols-[.7fr_1.3fr]">
              <div className="border-b border-black/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
                <div className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-black/40">
                  Choose a sign
                </div>

                <div className="space-y-2">
                  {demos.map((demo) => {
                    const active = activeDemo.id === demo.id;

                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => selectDemo(demo)}
                        className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition ${
                          active
                            ? "bg-[#F67A16] text-white"
                            : "bg-[#FFF8F3] hover:bg-[#FFF0E4]"
                        }`}
                      >
                        <div>
                          <div className="font-bold">{demo.label}</div>
                          <div
                            className={`mt-1 text-xs ${
                              active ? "text-white/65" : "text-black/40"
                            }`}
                          >
                            {demo.helper}
                          </div>
                        </div>

                        <ArrowUpRight />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-black/10 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {[0, 1, 2, 3].map((item) => (
                        <span
                          key={item}
                          className="h-2.5 w-2.5 rounded-full border border-white bg-[#F67A16]"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-black/40">
                      21-point hand tracking
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF6EF] p-6 md:p-10 lg:p-14">
                <div className="mx-auto max-w-lg">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">
                        Live preview
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {activeDemo.mode}
                      </div>
                    </div>

                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-[#F67A16]" />
                      {status}
                    </span>
                  </div>

                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[28px] bg-[#202124]">
                    <div className="absolute inset-5 rounded-[22px] border border-white/10" />

                    <span className="absolute left-5 top-5 h-5 w-5 border-l border-t border-[#F67A16]/60" />
                    <span className="absolute right-5 top-5 h-5 w-5 border-r border-t border-[#F67A16]/60" />
                    <span className="absolute bottom-5 left-5 h-5 w-5 border-b border-l border-[#F67A16]/60" />
                    <span className="absolute bottom-5 right-5 h-5 w-5 border-b border-r border-[#F67A16]/60" />

                    {isDynamic && (
                      <div className="absolute inset-0 z-0">
                        <FaceGuide />
                      </div>
                    )}

                    <div className="relative z-10 h-[88%] w-[88%]">
                      <AnimatedHand
                        pose={currentPose}
                        detecting={status !== "DETECTED"}
                      />
                    </div>

                    {status === "DETECTING" && (
                      <div className="scan-line absolute inset-x-6 z-20 h-px bg-[#F67A16] shadow-[0_0_12px_rgba(246,122,22,.7)]" />
                    )}

                    <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 backdrop-blur">
                      {isDynamic
                        ? `Face guide · Frame ${frameIndex + 1} / ${frames.length}`
                        : "21 landmarks"}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-black/10 pt-5">
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">
                          Detected
                        </div>

                        <div
                          key={`${activeDemo.id}-${cycle}`}
                          className="result-in mt-1 text-5xl font-black tracking-[-0.05em]"
                        >
                          {activeDemo.result}
                        </div>
                      </div>

                      <div className="rounded-full border border-black/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em]">
                        FSL
                      </div>
                    </div>

                    {isDynamic && (
                      <div className="mt-5 h-1 overflow-hidden rounded-full bg-black/10">
                        <div
                          className="h-full rounded-full bg-[#F67A16] transition-[width] duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 bg-[#202124] px-6 py-24 text-white md:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 max-w-3xl">
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F67A16]">
                Features
              </div>

              <h2 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.055em] md:text-7xl">
                Made for simple,
                <span className="text-[#F67A16]">
                  {" "}
                  accessible communication.
                </span>
              </h2>
            </div>

            <div className="grid border-t border-white/15 md:grid-cols-2">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`border-b border-white/15 py-9 md:p-9 ${
                    index % 2 === 0 ? "md:border-r" : ""
                  }`}
                >
                  <img
                    src={feature.icon}
                    alt=""
                    className="mb-7 h-14 w-14 rounded-xl bg-white object-contain p-1"
                  />

                  <h3 className="text-2xl font-bold tracking-[-0.035em]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="download"
          className="scroll-mt-20 px-6 py-24 md:px-8 lg:py-32"
        >
          <div className="mx-auto grid max-w-7xl items-end gap-14 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#D95F05]">
                Get SignSight
              </div>

              <h2 className="text-[clamp(4rem,8vw,7.5rem)] font-extrabold leading-[0.84] tracking-[-0.075em]">
                TAKE
                <span className="block">SIGNSIGHT</span>
                <span className="block text-[#F67A16]">WITH YOU.</span>
              </h2>
            </div>

            <div className="border-t border-black/15 pt-7">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#202124]">
                  <img
                    src="/icons/android.png"
                    alt="Android"
                    className="h-6 w-6 object-contain brightness-0 invert"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/40">
                    Available for
                  </div>
                  <div className="font-bold">Android</div>
                </div>
              </div>

              <p className="mt-6 max-w-md text-sm leading-6 text-black/50">
                Install SignSight on your Android device and start exploring
                supported Filipino Sign Language recognition.
              </p>

              <a
                href="#"
                className="mt-7 flex w-full items-center justify-between rounded-full bg-[#F67A16] px-6 py-4 font-semibold text-white transition hover:bg-[#E9650A]"
              >
                <span className="flex items-center gap-3">
                  <img
                    src="/icons/download.png"
                    alt=""
                    className="h-5 w-5 brightness-0 invert"
                  />
                  Download APK
                </span>

                <ArrowUpRight />
              </a>

              <div className="mt-4 text-xs font-medium text-black/40">
                iOS version in development
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 px-6 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm md:flex-row md:items-center">
          <div className="flex items-center gap-3 font-bold">
            <img
              src="/icons/logo.png"
              alt="SignSight"
              className="h-8 w-8 object-contain"
            />
            SignSight
          </div>

          <div className="flex flex-wrap gap-6 text-black/45">
            <a href="#experience" className="hover:text-black">
              Experience
            </a>
            <a href="#features" className="hover:text-black">
              Features
            </a>
            <a href="/plans" className="hover:text-black">
              Plans
            </a>
            <a href="#download" className="hover:text-black">
              Download
            </a>
          </div>

          <span className="text-xs text-black/35">© 2026 SignSight</span>
        </div>
      </footer>
    </div>
  );
}
