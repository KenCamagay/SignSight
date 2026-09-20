"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type Demo = {
  id: string;
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
    helper: "Live word translation",
  },
  {
    id: "thanks",
    label: "THANKS",
    result: "Thank you",
    mode: "Word Mode",
    helper: "Live word translation",
  },
];

const featureCards = [
  {
    number: "01",
    icon: "/icons/feature-translate.png",
    title: "Live Translation",
    desc: "Point the camera at a supported FSL sign and see the detected letter or word on screen.",
  },
  {
    number: "02",
    icon: "/icons/feature-landmark.png",
    title: "Hand Landmark Tracking",
    desc: "Tracks hand landmarks in real time to support fast on-device gesture recognition.",
  },
  {
    number: "03",
    icon: "/icons/feature-tutorial.png",
    title: "FSL Fingerspelling Tutorial",
    desc: "Learn and review FSL fingerspelling through a focused tutorial inside the app.",
  },
  {
    number: "04",
    icon: "/icons/feature-tips.png",
    title: "Recognition Tips",
    desc: "Simple guidance for hand placement, framing, and lighting before you start translating.",
  },
];

const heroChapters = [
  {
    number: "01",
    label: "Ready",
    short: "Frame the sign",
    status: "READY",
  },
  {
    number: "02",
    label: "Tracking",
    short: "Find hand landmarks",
    status: "TRACKING",
  },
  {
    number: "03",
    label: "Detecting",
    short: "Analyze the gesture",
    status: "SCANNING",
  },
  {
    number: "04",
    label: "Translated",
    short: "Show the result",
    status: "DETECTED",
  },
] as const;

const landmarkPoints = [
  [50, 73], [43, 63], [38, 52], [34, 41], [31, 31],
  [48, 57], [47, 43], [46, 31], [46, 21],
  [57, 56], [59, 41], [60, 29], [61, 20],
  [66, 61], [70, 50], [73, 41], [76, 34],
  [69, 70], [78, 66], [84, 61], [89, 56],
] as const;

function IconImg({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={className} />;
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function SignSightDownloadPage() {
  const [activeDemo, setActiveDemo] = useState<Demo>(demos[1]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackingPoint, setTrackingPoint] = useState({ x: 50, y: 50 });
  const [detectionBurst, setDetectionBurst] = useState(0);
  const [heroScroll, setHeroScroll] = useState(0);
  const [autoDemo, setAutoDemo] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  // Keep the final translated state close to the end of the sticky hero so
  // there is no long “finished but still scrolling” dead zone.
  const heroChapterIndex =
    heroScroll < 0.25 ? 0 :
    heroScroll < 0.50 ? 1 :
    heroScroll < 0.75 ? 2 : 3;
  const heroChapter = heroChapters[heroChapterIndex];

  useEffect(() => {
    let frame = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const updateScrollScene = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;

      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const travel = Math.max(rect.height - viewportHeight, 1);
        setHeroScroll(clamp(-rect.top / travel));
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollScene);
    };

    updateScrollScene();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!autoDemo) return;

    const timer = window.setInterval(() => {
      setActiveDemo((current) => {
        const currentIndex = demos.findIndex((demo) => demo.id === current.id);
        return demos[(currentIndex + 1) % demos.length];
      });
      setDetectionBurst((value) => value + 1);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [autoDemo]);


  const jumpToHeroChapter = (index: number) => {
    const section = heroRef.current;
    if (!section) return;
    const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
    const chapterStops = [0.02, 0.28, 0.54, 0.80];
    const targetProgress = chapterStops[Math.max(0, Math.min(3, index))];
    window.scrollTo({
      top: section.offsetTop + travel * targetProgress,
      behavior: "smooth",
    });
  };

  const handleTrackingMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setTrackingPoint({ x, y });
  };

  const triggerDetection = () => {
    const currentIndex = demos.findIndex((demo) => demo.id === activeDemo.id);
    setActiveDemo(demos[(currentIndex + 1) % demos.length]);
    setDetectionBurst((value) => value + 1);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFAF6] text-[#202124] selection:bg-[#F67A16]/[0.08] selection:text-[#202124]">
      <style jsx global>{`
        @keyframes signsight-float {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes signsight-scan {
          0% { transform: translateY(-140%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(640%); opacity: 0; }
        }
        @keyframes signsight-pop {
          0% { transform: translate(-50%, -50%) scale(.35); opacity: .95; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes signsight-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes signsight-landmark-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(.82); opacity: .62; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
        @keyframes signsight-result-in {
          0% { transform: translateY(18px) scale(.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .signsight-float { animation: signsight-float 6s ease-in-out infinite; }
        .signsight-scan { animation: signsight-scan 3.4s linear infinite; }
        .signsight-pop { animation: signsight-pop .7s ease-out forwards; }
        .signsight-ticker { animation: signsight-ticker 18s linear infinite; }
        .signsight-landmark { animation: signsight-landmark-pulse 1.4s ease-in-out infinite; }
        .signsight-result-in { animation: signsight-result-in .42s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .signsight-float, .signsight-scan, .signsight-pop, .signsight-ticker, .signsight-landmark, .signsight-result-in { animation: none !important; }
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-[#F67A16]/20 bg-[#FFFAF6]/92 p-1.5 shadow-[0_8px_28px_rgba(38,35,33,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <a
              href="#top"
              className="group flex min-w-0 items-center gap-3 rounded-[21px] px-3 py-2.5 text-[#202124] transition hover:bg-[#FFF0E4] md:px-4"
            >
      
              <div className="hidden leading-none sm:block">
                <div className="text-[14px] font-black tracking-[-0.03em]">SignSight</div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/40">FSL / Computer Vision</div>
              </div>
            </a>

            <nav className="hidden flex-1 items-center justify-center gap-1 rounded-[21px] bg-[#FFF4EC] p-1 md:flex">
              {[
                ["01", "Experience", "#experience"],
                ["02", "Features", "#features"],
                ["03", "Plans", "/plans"],
                ["03", "Download", "#download"],
              ].map(([number, label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-semibold transition hover:bg-[#FFF0E4] hover:text-[#202124]"
                >
                  <span className="text-[9px] font-bold text-[#F67A16] transition group-hover:text-[#E9650A]">{number}</span>
                  <span>{label}</span>
                  <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 bg-[#F67A16] transition-transform group-hover:scale-x-100" />
                </a>
              ))}
            </nav>

            <a
              href="#download"
              className="ml-auto hidden h-11 items-center gap-2 rounded-[19px] border border-[#F67A16]/25 bg-[#F67A16]/[0.07] px-5 text-sm font-semibold text-[#A84D08] transition hover:border-[#F67A16]/40 hover:bg-[#F67A16]/10 lg:inline-flex"
            >
              Get the app <ArrowUpRight />
            </a>

            <div className="ml-auto hidden items-center gap-2 rounded-[19px] border border-[#F67A16]/20 bg-[#FFF6EF] px-3 py-2 lg:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#F67A16]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">FSL Live</span>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="ml-auto grid h-11 w-11 place-items-center rounded-[19px] border border-black/10 bg-[#FFF9F5] md:hidden"
              aria-label="Toggle menu"
            >
              <span className="text-lg font-black">{menuOpen ? "×" : "≡"}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-3 max-w-7xl rounded-[26px] border border-[#F67A16]/15 bg-[#FFFAF6] p-2 shadow-[0_12px_30px_rgba(32,33,36,0.12)] md:hidden">
            <div className="rounded-[20px] bg-[#FFF6EF] p-2">
              {[
                ["01", "Experience", "#experience"],
                ["02", "Features", "#features"],
                ["03", "Plans", "/plans"],
                ["04", "Download", "#download"],
              ].map(([number, label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 font-semibold transition hover:bg-[#FFF0E4] hover:text-[#202124]"
                >
                  <span className="flex items-center gap-3"><span className="text-[10px] text-[#F67A16]">{number}</span>{label}</span>
                  <ArrowUpRight />
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section ref={heroRef} className="relative h-[168vh] border-b border-black/10 lg:h-[145vh]">
          <div className="sticky top-0 flex min-h-screen flex-col overflow-hidden bg-[#FFFAF6] pt-28">
            <div className="absolute -left-24 top-36 h-72 w-72 rounded-full bg-[#F67A16]/10 blur-3xl" />
            <div
              className="absolute -right-20 bottom-16 h-96 w-96 rounded-full bg-[#FFA25A]/[0.07] blur-3xl transition-all duration-500"
              style={{ transform: `scale(${0.96 + heroScroll * 0.08})`, opacity: 0.72 - heroScroll * 0.1 }}
            />

            <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,#202124_1px,transparent_1px),linear-gradient(to_bottom,#202124_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />

            <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 pb-10 pt-6 md:px-8 lg:grid-cols-[.92fr_1.08fr] lg:pb-8 lg:pt-8">
              <div className="relative z-10">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-3 rounded-full border border-[#F67A16]/20 bg-white/65 py-2 pl-2 pr-4 shadow-sm backdrop-blur">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F67A16]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#A54B08]">Camera-based FSL translation</span>
                  </div>

                  <div className="rounded-full border border-black/10 bg-[#FFF5EF] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#62646A]">
                    {heroChapter.number} · {heroChapter.label}
                  </div>
                </div>

                <h1
                  className="max-w-3xl text-[clamp(4rem,8.6vw,8rem)] font-extrabold leading-[0.81] tracking-[-0.075em]"
                  style={{
                    transform: `translateY(${-heroScroll * 10}px)`,
                    opacity: 1 - heroScroll * 0.16,
                  }}
                >
                  SIGN
                  <span className="block text-[#F67A16]">SEEN.</span>
                  <span className="block">WORDS</span>
                  <span className="block">UNDERSTOOD.</span>
                </h1>

                <div className="mt-7 grid max-w-2xl gap-6 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="max-w-xl text-base font-medium leading-7 text-black/60 md:text-lg">
                      SignSight turns supported FSL hand signs into readable text through your phone camera — designed to make everyday communication more accessible and immediate.
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-black/45">
                      <span className="h-px w-8 bg-[#F67A16]" />
                      {heroChapter.short}
                    </div>
                  </div>

                  <a
                    href="#experience"
                    className="group flex h-14 w-14 items-center justify-center rounded-full border border-black/20 bg-white/25 transition hover:bg-[#FFF0E4] hover:text-[#202124]"
                    aria-label="Explore the experience"
                  >
                    <ChevronDown />
                  </a>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#download"
                    className="inline-flex h-14 items-center gap-3 rounded-full bg-[#F67A16] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(246,122,22,0.16)] transition hover:-translate-y-1 hover:bg-[#E9650A]"
                  >
                    <IconImg src="/icons/android.png" alt="Android" className="h-5 w-5 object-contain brightness-0 invert" />
                    Download for Android
                  </a>
                  <button
                    type="button"
                    onClick={() => jumpToHeroChapter((heroChapterIndex + 1) % heroChapters.length)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/55 px-5 py-3 text-sm font-semibold backdrop-blur transition hover:-translate-y-1 hover:bg-white"
                  >
                    Next scene <ArrowUpRight />
                  </button>
                </div>

                <div className="mt-7 hidden max-w-xl grid-cols-4 gap-2 md:grid">
                  {heroChapters.map((chapter, index) => {
                    const active = index === heroChapterIndex;
                    return (
                      <button
                        key={chapter.label}
                        type="button"
                        onClick={() => jumpToHeroChapter(index)}
                        className={`group rounded-2xl border border-black/10 px-3 py-3 text-left transition-all ${
                          active
                            ? "border-[#F67A16]/25 bg-[#FFF2E8] text-[#202124] shadow-sm"
                            : "bg-[#FFF9F5] hover:bg-white"
                        }`}
                        aria-pressed={active}
                      >
                        <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${active ? "text-[#FF9B4A]" : "text-black/35"}`}>
                          {chapter.number}
                        </div>
                        <div className="mt-1 text-xs font-semibold">{chapter.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mx-auto flex w-full max-w-[650px] items-center justify-center lg:justify-end">
                <div
                  className="absolute left-1/2 top-1/2 h-[500px] w-[500px] rounded-full bg-[#FFE1C8]/[0.42] transition-all duration-500 sm:h-[540px] sm:w-[540px]"
                  style={{ transform: `translate(-50%, -50%) scale(${0.94 + heroScroll * 0.06})`, opacity: 0.88 - heroScroll * 0.1 }}
                />

                <button
                  type="button"
                  onClick={() => jumpToHeroChapter(1)}
                  className={`absolute left-[0%] top-[10%] z-30 hidden rounded-2xl border border-black/10 px-4 py-3 text-left shadow-[0_10px_25px_rgba(32,33,36,.10)] transition lg:block ${
                    heroChapterIndex === 1 ? "bg-[#FFEEDD] text-[#202124]" : "bg-[#FFFAF6]"
                  }`}
                  style={{ transform: `translateY(${-heroScroll * 12}px)` }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-45">Tracking</div>
                  <div className="mt-1 text-sm font-semibold">21 landmarks</div>
                </button>

                <button
                  type="button"
                  onClick={() => jumpToHeroChapter(3)}
                  className={`absolute bottom-[8%] right-[-1%] z-30 hidden rounded-2xl border border-black/10 px-4 py-3 text-left shadow-[0_10px_25px_rgba(32,33,36,.10)] transition lg:block ${
                    heroChapterIndex === 3 ? "bg-[#FFD9BC] text-[#202124]" : "bg-[#FFF8F4] text-[#202124]"
                  }`}
                  style={{ transform: `translateY(${heroScroll * 12}px)` }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-45">Result</div>
                  <div className="mt-1 text-lg font-black">{activeDemo.result}</div>
                </button>

                <div
                  className="relative z-10 transition-transform duration-300"
                  style={{ transform: `translateY(${-heroScroll * 18}px) scale(${0.97 + heroScroll * 0.03})` }}
                >
                  <div className="relative w-[285px] rounded-[52px] border-[10px] border-[#202124] bg-[#1D1E21] p-2 shadow-[0_26px_60px_rgba(32,33,36,0.16)] sm:w-[325px]">
                    <div className="absolute left-1/2 top-3 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-[#1D1E21]" />
                    <div className="relative aspect-[9/19.4] overflow-hidden rounded-[38px] bg-[#FFF8F3]">
                      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-9 text-[10px] font-black text-black/65">
                        <span>SignSight</span>
                        <span
                          className={`rounded-full px-2 py-1 transition-colors ${
                            heroChapterIndex >= 2 ? "bg-[#FFEEDD] text-[#202124]" : "bg-white/85"
                          }`}
                        >
                          {heroChapter.status}
                        </span>
                      </div>

                      <div className="absolute inset-x-5 top-[18%] h-[54%] overflow-hidden rounded-[28px] border border-[#F67A16]/35 bg-gradient-to-br from-[#FFDCC2] via-[#FFF1E6] to-[#FFFAF6]">
                        <div className="absolute inset-4 rounded-[20px] border border-dashed border-[#F67A16]/45" />
                        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F67A16]/[0.08] blur-xl" />
                        <IconImg
                          src="/icons/hero-hand.png"
                          alt="FSL hand sign preview"
                          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-xl transition-all duration-500 sm:h-44 sm:w-44"
                        />

                        {heroChapterIndex >= 1 && landmarkPoints.map(([x, y], index) => (
                          <span
                            key={`${x}-${y}`}
                            className="signsight-landmark absolute z-20 h-2.5 w-2.5 rounded-full border border-white bg-[#F67A16] shadow-[0_0_10px_rgba(246,122,22,.22)]"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              animationDelay: `${index * 38}ms`,
                            }}
                          />
                        ))}

                        {heroChapterIndex >= 1 && (
                          <div
                            className="pointer-events-none absolute z-20 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#202124] transition-all duration-100"
                            style={{
                              left: `${[50, 47, 58, 54][heroChapterIndex]}%`,
                              top: `${[50, 45, 52, 48][heroChapterIndex]}%`,
                            }}
                          >
                            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#202124]" />
                          </div>
                        )}

                        {heroChapterIndex >= 2 && (
                          <div className="signsight-scan absolute inset-x-0 top-0 z-30 h-16 bg-gradient-to-b from-transparent via-[#F67A16]/[0.42] to-transparent" />
                        )}

                        <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#F67A16]" />
                        <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#F67A16]" />
                        <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#F67A16]" />
                        <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#F67A16]" />

                        <div className="absolute inset-x-3 bottom-3 z-30 flex items-center justify-between gap-2">
                          <div className="rounded-full bg-[#202124]/85 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                            {heroChapterIndex === 0 && "Place hand in frame"}
                            {heroChapterIndex === 1 && "Landmarks locked"}
                            {heroChapterIndex === 2 && "Analyzing gesture"}
                            {heroChapterIndex === 3 && "Translation complete"}
                          </div>
                          {heroChapterIndex >= 1 && (
                            <div className="rounded-full bg-white/85 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-black backdrop-blur">
                              FSL
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={triggerDetection}
                        className={`absolute inset-x-5 bottom-5 rounded-[28px] p-5 text-left shadow-xl transition-all duration-500 ${
                          heroChapterIndex === 3
                            ? "signsight-result-in bg-[#FFF2E8] text-[#202124]"
                            : "border border-black/10 bg-white/80 text-[#202124] backdrop-blur"
                        }`}
                        aria-label="Try the next sample sign"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className={`text-[9px] font-bold uppercase tracking-[0.2em] ${heroChapterIndex === 3 ? "text-black/40" : "text-black/35"}`}>
                              {heroChapterIndex === 3 ? "Translation" : "Live process"}
                            </div>
                            <div className="mt-1 text-2xl font-black tracking-[-0.04em]">
                              {heroChapterIndex === 0 && "Ready"}
                              {heroChapterIndex === 1 && "Tracking…"}
                              {heroChapterIndex === 2 && "Detecting…"}
                              {heroChapterIndex === 3 && activeDemo.result}
                            </div>
                          </div>
                          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#F67A16]">
                            <IconImg src={heroChapterIndex === 3 ? "/icons/check.png" : "/icons/logo.png"} alt="SignSight status" className="h-6 w-6 object-contain" />
                          </div>
                        </div>
                        <div className={`mt-4 h-1 overflow-hidden rounded-full ${heroChapterIndex === 3 ? "bg-black/10" : "bg-black/10"}`}>
                          <div
                            className="h-full rounded-full bg-[#F67A16] transition-all duration-500"
                            style={{ width: `${22 + heroChapterIndex * 26}%` }}
                          />
                        </div>
                        <div className={`mt-3 text-[8px] font-bold uppercase tracking-[0.14em] ${heroChapterIndex === 3 ? "text-black/35" : "text-black/35"}`}>
                          Tap card to cycle sample
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex">
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-black/35 [writing-mode:vertical-rl]">Scroll the story</span>
                  <span className="relative h-28 w-px bg-black/15">
                    <span className="absolute left-1/2 top-0 block w-1 -translate-x-1/2 rounded-full bg-[#F67A16] transition-[height] duration-150" style={{ height: `${Math.max(heroScroll, 0.04) * 100}%` }} />
                  </span>
                </div>
              </div>
            </div>

            <div className="relative border-t border-black/10 bg-[#25262A] text-white">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] md:px-8">
                <span className="text-white/45">Scroll-driven product demo</span>
                <span>Frame</span>
                <span className="text-[#FF9B4A]">•</span>
                <span>Track</span>
                <span className="text-[#FF9B4A]">•</span>
                <span>Detect</span>
                <span className="text-[#FF9B4A]">•</span>
                <span>Translate</span>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="relative px-6 pb-24 pt-8 md:px-8 md:pt-10 lg:pb-32 lg:pt-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <div className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#D95F05]">Try the interaction</div>
                <h2 className="max-w-xl text-5xl font-extrabold leading-[0.95] tracking-[-0.055em] md:text-7xl">
                  Don’t just read about it.
                  <span className="text-[#F67A16]"> Play with it.</span>
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-8 text-black/55">
                  Switch between sample signs to preview how the interface responds. The real app uses the camera; this section makes the website feel like part of the product.
                </p>
              </div>

              <div className="overflow-hidden rounded-[38px] border border-black/10 bg-[#FFF3EA] shadow-[0_20px_55px_rgba(32,33,36,0.12)]">
                <div className="border-b border-black/10 px-5 py-4 md:px-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Interactive translator preview</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-xs font-black">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
                        Demo mode
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoDemo((value) => !value)}
                        className={`rounded-full border border-black/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] transition ${
                          autoDemo ? "bg-[#25262A] text-white" : "bg-[#FFF6EF] hover:bg-white"
                        }`}
                        aria-pressed={autoDemo}
                      >
                        Auto {autoDemo ? "on" : "off"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid min-h-[520px] md:grid-cols-[1fr_1.1fr]">
                  <div className="border-b border-black/10 p-6 md:border-b-0 md:border-r-2 md:p-8">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-black/50">Choose a sample</div>
                    <div className="mt-5 space-y-3">
                      {demos.map((demo) => {
                        const active = activeDemo.id === demo.id;
                        return (
                          <button
                            type="button"
                            key={demo.id}
                            onClick={() => setActiveDemo(demo)}
                            className={`group flex w-full items-center justify-between rounded-3xl border border-black/10 p-4 text-left transition-all ${
                              active
                                ? "bg-[#FFF0E4] text-[#202124] shadow-sm"
                                : "bg-[#FFF9F5] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`grid h-14 w-14 place-items-center rounded-2xl text-xl font-black ${active ? "bg-[#F67A16]" : "bg-white"}`}>
                                {demo.label.slice(0, 1)}
                              </div>
                              <div>
                                <div className="font-black">{demo.label}</div>
                                <div className={`mt-1 text-xs font-bold ${active ? "text-black/45" : "text-black/45"}`}>
                                  {demo.helper}
                                </div>
                              </div>
                            </div>
                            <ArrowUpRight />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-[#202124] py-2 text-white">
                      <div className="signsight-ticker flex w-max gap-8 whitespace-nowrap px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                        <span>FSL · CAMERA TRACKING · {activeDemo.result} · LIVE PREVIEW ·</span>
                        <span>FSL · CAMERA TRACKING · {activeDemo.result} · LIVE PREVIEW ·</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[#FFF6EF] p-7 md:p-10">
                    <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(#202124_1px,transparent_1px)] [background-size:18px_18px]" />
                    <div className="relative w-full max-w-md rounded-[34px] border border-black/10 bg-white p-5 shadow-[0_14px_36px_rgba(32,33,36,0.10)]">
                      <div className="flex items-center justify-between border-b border-black/10 pb-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Current mode</div>
                          <div className="mt-1 font-black">{activeDemo.mode}</div>
                        </div>
                        <span className="rounded-full bg-[#F67A16]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A84D08]">Live preview</span>
                      </div>

                      <div
                        onMouseMove={handleTrackingMove}
                        onClick={triggerDetection}
                        className="group relative my-5 grid aspect-[4/3] cursor-crosshair place-items-center overflow-hidden rounded-[26px] bg-[#202124]"
                        title="Move your pointer to simulate tracking. Click to detect the next sample."
                      >
                        <div className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 backdrop-blur">
                          Move pointer · Click to detect
                        </div>
                        <div className="relative grid h-[76%] w-[76%] place-items-center rounded-[24px] border border-[#F67A16]/40 bg-[#2D2F33] transition duration-300 group-hover:border-[#F67A16] group-hover:shadow-[0_0_30px_rgba(246,122,22,.10)]">
                          <IconImg src="/icons/hero-hand.png" alt="FSL hand sign preview" className="h-28 w-28 object-contain transition duration-300 group-hover:scale-105" />
                          <div className="absolute inset-x-0 h-px bg-[#F67A16] shadow-[0_0_10px_rgba(246,122,22,.28)] signsight-scan" />
                        </div>

                        <div
                          className="pointer-events-none absolute z-30 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F67A16] transition-[left,top] duration-75"
                          style={{ left: `${trackingPoint.x}%`, top: `${trackingPoint.y}%` }}
                        >
                          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F67A16] shadow-[0_0_8px_rgba(246,122,22,.28)]" />
                          <span className="absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 bg-[#F67A16]/45" />
                          <span className="absolute left-1/2 top-1/2 h-16 w-px -translate-x-1/2 -translate-y-1/2 bg-[#F67A16]/45" />
                        </div>

                        {detectionBurst > 0 && (
                          <span
                            key={detectionBurst}
                            className="signsight-pop pointer-events-none absolute z-20 h-24 w-24 rounded-full border-2 border-[#F67A16]"
                            style={{ left: `${trackingPoint.x}%`, top: `${trackingPoint.y}%` }}
                          />
                        )}
                      </div>

                      <div key={activeDemo.id} className="rounded-[24px] border border-[#F67A16]/15 bg-[#FFF5EE] p-5 transition-all">
                        <div className="flex items-end justify-between gap-5">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Detected result</div>
                            <div className="mt-1 text-4xl font-black tracking-[-0.05em]">{activeDemo.result}</div>
                          </div>
                          <div className="rounded-full border-2 border-black px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">FSL</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-[#202124] px-6 py-24 text-white md:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <div className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#F67A16]">What’s inside</div>
                <h2 className="max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-[-0.055em] md:text-7xl">
                  Built around real-time signing.
                </h2>
              </div>
              <p className="max-w-sm text-sm font-medium leading-6 text-white/45">
                Four focused tools work together to make recognition, learning, and feedback feel simple.
              </p>
            </div>

            <div className="grid overflow-hidden rounded-[36px] border border-white/10 lg:grid-cols-2">
              {featureCards.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`group relative min-h-[320px] overflow-hidden border-white/15 p-7 transition duration-500 hover:bg-[#292B2F] md:p-10 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:origin-left before:scale-x-0 before:bg-[#F67A16] before:transition-transform before:duration-300 hover:before:scale-x-100 ${
                    index % 2 === 0 ? "lg:border-r" : ""
                  } ${index < 2 ? "border-b" : index === 2 ? "border-b lg:border-b-0" : ""}`}
                >
                  <div className="absolute right-[-20px] top-[-34px] text-[150px] font-black leading-none tracking-[-0.09em] text-white/[0.035] transition group-hover:text-white/[0.06]">
                    {feature.number}
                  </div>
                  <div className="relative flex h-full flex-col justify-between gap-16">
                    <div className="flex items-start justify-between">
                      <div className="grid h-20 w-20 place-items-center rounded-[22px] bg-white p-2 text-black transition duration-300 group-hover:scale-105 group-hover:bg-[#FFF2E8] group-hover:shadow-sm">
                        <IconImg src={feature.icon} alt={feature.title} className="h-full w-full object-contain" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/35 group-hover:text-white/55">{feature.number}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">{feature.title}</h3>
                      <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-white/50 transition group-hover:text-white/70 md:text-base">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="relative overflow-hidden border-t border-[#F67A16]/10 bg-[#FFFAF6] px-6 py-24 md:px-8 lg:py-32">
          <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,#202124_1px,transparent_1px),linear-gradient(to_bottom,#202124_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-[#F67A16]/25 bg-[#FFF2E8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#A84D08]">
                  Android download
                </div>
                <h2 className="max-w-4xl text-[clamp(3.8rem,8vw,7.5rem)] font-extrabold leading-[0.84] tracking-[-0.075em]">
                  TAKE
                  <span className="block">SIGNSIGHT</span>
                  <span className="block text-[#F67A16]">WITH YOU.</span>
                </h2>
              </div>

              <div className="rounded-[34px] border border-black/10 bg-[#FFF9F5] p-5 shadow-[0_18px_50px_rgba(32,33,36,0.10)] md:p-7">
                <div className="flex items-center gap-4 border-b border-black/10 pb-5">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#202124]">
                    <IconImg src="/icons/android.png" alt="Android" className="h-7 w-7 object-contain brightness-0 invert" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">Available platform</div>
                    <div className="mt-1 text-2xl font-black">Android</div>
                  </div>
                </div>

                <div className="grid gap-3 py-5 text-sm font-bold sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-black/35">App</div>
                    <div className="mt-1">SignSight</div>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-black/35">Status</div>
                    <div className="mt-1">Ready to install</div>
                  </div>
                </div>

                <a
                  href="#"
                  className="flex h-16 w-full items-center justify-between rounded-2xl bg-[#F67A16] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(246,122,22,.18)] transition hover:bg-[#E9650A]"
                >
                  <span className="flex items-center gap-3">
                    <IconImg src="/icons/download.png" alt="Download" className="h-5 w-5 object-contain brightness-0 invert" />
                    Download APK
                  </span>
                  <ArrowUpRight />
                </a>

                <div className="mt-4 flex items-center justify-between gap-4 text-xs font-bold text-black/45">
                  <span>iOS version in development</span>
                  <span>SignSight</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#202124] px-6 py-10 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F67A16]">
              <IconImg src="/icons/logo.png" alt="SignSight" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <div className="font-extrabold">SignSight</div>
              <div className="mt-1 text-xs font-bold text-white/35">Camera-based FSL translator</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/55">
            <a href="#experience" className="transition hover:text-white">Experience</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#download" className="transition hover:text-white">Download</a>
            <a href="#" className="transition hover:text-white">GitHub</a>
          </div>

          <p className="text-xs font-bold text-white/30">© 2026 SignSight</p>
        </div>
      </footer>
    </div>
  );
}
