"use client";

import { useState } from "react";

type Billing = "monthly" | "yearly";
type Payment = "GCash" | "Maya" | "Credit / Debit Card";
type Step = "idle" | "checkout" | "success";

const freeFeatures = [
  "Real-time supported FSL sign recognition",
  "Letter and supported word recognition",
  "FSL fingerspelling tutorial",
  "Recognition and camera tips",
  "Up to 10 saved signs",
  "Recent translation history",
];

const plusFeatures = [
  "Everything included in Free",
  "Complete learning & practice library",
  "Unlimited saved signs",
  "Unlimited translation history",
  "Learning progress & practice insights",
  "Additional practice features",
  "Early access to future learning tools",
];

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function Check() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F67A16] text-[11px] font-black text-white">
      ✓
    </span>
  );
}

export default function PlansPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [step, setStep] = useState<Step>("idle");
  const [payment, setPayment] = useState<Payment>("GCash");

  const price = billing === "monthly" ? "₱99" : "₱999";
  const cadence = billing === "monthly" ? "month" : "year";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFAF6] text-[#202124] selection:bg-[#F67A16]/10">

      {/* ================= NAVBAR ================= */}

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-[#F67A16]/20 bg-[#FFFAF6]/92 p-1.5 shadow-[0_8px_28px_rgba(38,35,33,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-2">

            <a
              href="/download"
              className="flex items-center gap-3 rounded-[21px] px-4 py-2.5 transition hover:bg-[#FFF0E4]"
            >
              <img
                src="/icons/logo.png"
                alt="SignSight"
                className="h-8 w-8 object-contain"
              />

              <div className="hidden leading-none sm:block">
                <div className="text-[14px] font-black tracking-[-0.03em]">
                  SignSight
                </div>

                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/40">
                  FSL / Computer Vision
                </div>
              </div>
            </a>

            <nav className="ml-auto hidden items-center gap-1 rounded-[21px] bg-[#FFF4EC] p-1 md:flex">

              <a
                href="/download#experience"
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF0E4]"
              >
                <span className="mr-2 text-[9px] font-bold text-[#F67A16]">
                  01
                </span>
                Experience
              </a>

              <a
                href="/download#features"
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF0E4]"
              >
                <span className="mr-2 text-[9px] font-bold text-[#F67A16]">
                  02
                </span>
                Features
              </a>

              <a
                href="/plans"
                className="rounded-2xl bg-[#F67A16] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <span className="mr-2 text-[9px] font-bold text-white/70">
                  03
                </span>
                Plans
              </a>

              <a
                href="/download#download"
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF0E4]"
              >
                <span className="mr-2 text-[9px] font-bold text-[#F67A16]">
                  04
                </span>
                Download
              </a>

            </nav>

            <a
              href="/download#download"
              className="ml-auto inline-flex h-11 items-center gap-2 rounded-[19px] bg-[#202124] px-5 text-sm font-semibold text-white md:ml-2"
            >
              Get the app
              <ArrowUpRight />
            </a>

          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main>

        {/* HERO */}

        <section className="relative overflow-hidden px-6 pb-20 pt-36 md:px-8 md:pt-44 lg:pb-28">

          <div className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(to_right,#202124_1px,transparent_1px),linear-gradient(to_bottom,#202124_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

          <div className="absolute -left-28 top-40 h-80 w-80 rounded-full bg-[#F67A16]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">

            <div className="inline-flex rounded-full border border-[#F67A16]/25 bg-[#FFF2E8] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#A84D08]">
              03 · Plans
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">

              <h1 className="max-w-4xl text-[clamp(4rem,9vw,8rem)] font-extrabold leading-[0.82] tracking-[-0.075em]">
                CHOOSE HOW
                <br />
                <span className="text-[#F67A16]">
                  YOU SIGNSIGHT.
                </span>
              </h1>

              <p className="max-w-lg text-lg font-medium leading-8 text-black/55">
                Keep core FSL recognition accessible for free. Upgrade
                for more learning, practice, history, and personalization.
              </p>

            </div>

            {/* BILLING TOGGLE */}

            <div className="mt-12 flex justify-center">

              <div className="inline-flex rounded-full border border-black/10 bg-white p-1.5 shadow-sm">

                <button
                  onClick={() => setBilling("monthly")}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    billing === "monthly"
                      ? "bg-[#202124] text-white"
                      : "text-black/50"
                  }`}
                >
                  Monthly
                </button>

                <button
                  onClick={() => setBilling("yearly")}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    billing === "yearly"
                      ? "bg-[#202124] text-white"
                      : "text-black/50"
                  }`}
                >
                  Yearly
                  <span className="ml-1 text-[#F67A16]">
                    Save 16%
                  </span>
                </button>

              </div>

            </div>

            {/* ================= PLAN CARDS ================= */}

            <div className="mt-8 grid gap-5 lg:grid-cols-2">

              {/* FREE */}

              <article className="flex min-h-[590px] flex-col rounded-[38px] border border-black/10 bg-[#FFF9F5] p-7 shadow-[0_18px_50px_rgba(32,33,36,.08)] md:p-10">

                <div className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
                  01 · Free
                </div>

                <h2 className="mt-5 text-5xl font-black tracking-[-0.055em]">
                  Start simple.
                </h2>

                <div className="mt-8 flex items-end gap-2">

                  <span className="text-6xl font-black tracking-[-0.06em]">
                    ₱0
                  </span>

                  <span className="pb-2 text-sm font-bold text-black/40">
                    forever
                  </span>

                </div>

                <div className="my-8 h-px bg-black/10" />

                <div className="space-y-4">

                  {freeFeatures.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm font-semibold leading-6"
                    >
                      <Check />
                      <span>{item}</span>
                    </div>
                  ))}

                </div>

                <a
                  href="/download#download"
                  className="mt-auto flex h-16 items-center justify-between rounded-2xl border border-black/15 px-5 font-bold transition hover:bg-white"
                >
                  Continue Free
                  <ArrowUpRight />
                </a>

              </article>

              {/* PLUS */}

              <article className="relative flex min-h-[590px] flex-col overflow-hidden rounded-[38px] bg-[#202124] p-7 text-white shadow-[0_24px_65px_rgba(32,33,36,.18)] md:p-10">

                <div className="absolute right-[-18px] top-[-45px] text-[180px] font-black leading-none text-white/[.035]">
                  02
                </div>

                <div className="relative flex items-center justify-between gap-3">

                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#FF9B4A]">
                    02 · SignSight Plus
                  </div>

                  <span className="rounded-full bg-[#F67A16] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em]">
                    Most popular
                  </span>

                </div>

                <h2 className="relative mt-5 text-5xl font-black tracking-[-0.055em]">
                  Learn more.
                  <br />
                  Keep more.
                </h2>

                <div className="relative mt-8 flex items-end gap-2">

                  <span className="text-6xl font-black tracking-[-0.06em]">
                    {price}
                  </span>

                  <span className="pb-2 text-sm font-bold text-white/40">
                    / {cadence}
                  </span>

                </div>

                <div className="relative my-8 h-px bg-white/10" />

                <div className="relative space-y-4">

                  {plusFeatures.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm font-semibold leading-6 text-white/80"
                    >
                      <Check />
                      <span>{item}</span>
                    </div>
                  ))}

                </div>

                <button
                  onClick={() => setStep("checkout")}
                  className="relative mt-auto flex h-16 items-center justify-between rounded-2xl bg-[#F67A16] px-5 font-bold text-white shadow-[0_10px_24px_rgba(246,122,22,.18)] transition hover:bg-[#E9650A]"
                >
                  Get SignSight Plus
                  <ArrowUpRight />
                </button>

              </article>

            </div>
          </div>
        </section>

        {/* ================= WHY PLUS ================= */}

        <section className="bg-[#202124] px-6 py-20 text-white md:px-8">

          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">

            <div>

              <div className="text-xs font-bold uppercase tracking-[.22em] text-[#F67A16]">
                Why Plus?
              </div>

              <h2 className="mt-4 text-5xl font-extrabold leading-[.95] tracking-[-.055em]">
                Communication first.
                <br />

                <span className="text-[#FF9B4A]">
                  Extras when you want them.
                </span>

              </h2>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="rounded-[28px] border border-white/10 p-6">

                <div className="text-3xl font-black text-[#F67A16]">
                  CORE
                </div>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Supported FSL recognition remains part of the free
                  experience.
                </p>

              </div>

              <div className="rounded-[28px] border border-white/10 p-6">

                <div className="text-3xl font-black text-[#F67A16]">
                  PLUS
                </div>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  The paid sample plan focuses on learning, saved
                  activity, progress, and future premium tools.
                </p>

              </div>

            </div>

          </div>
        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="bg-[#FFFAF6] px-6 py-9 md:px-8">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">

          <div className="flex items-center gap-3">

            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F67A16]">

              <img
                src="/icons/logo.png"
                alt="SignSight"
                className="h-6 w-6 object-contain"
              />

            </div>

            <div>

              <div className="font-extrabold">
                SignSight
              </div>

              <div className="text-xs font-bold text-black/35">
                Camera-based FSL translator
              </div>

            </div>

          </div>

          <p className="text-xs font-bold text-black/30">
            © 2026 SignSight
          </p>

        </div>

      </footer>

      {/* ================= CHECKOUT MODAL ================= */}

      {step !== "idle" && (

        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#202124]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setStep("idle");
            }
          }}
        >

          <div className="w-full max-w-lg rounded-[36px] border border-black/10 bg-[#FFFAF6] p-6 shadow-2xl md:p-8">

            {step === "checkout" ? (
              <>

                {/* CHECKOUT HEADER */}

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#D95F05]">
                      Demo checkout
                    </div>

                    <h3 className="mt-2 text-3xl font-black tracking-[-.04em]">
                      Start SignSight Plus
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-black/45">
                      {price} / {cadence} · Cancel anytime
                    </p>

                  </div>

                  <button
                    onClick={() => setStep("idle")}
                    className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-xl"
                  >
                    ×
                  </button>

                </div>

                {/* DEMO WARNING */}

                <div className="mt-6 rounded-2xl border border-[#F67A16]/20 bg-[#FFF0E4] p-4 text-xs font-semibold leading-5 text-[#8A430D]">
                  Demo only — no actual payment will be processed.
                  Do not enter real financial information.
                </div>

                {/* PAYMENT METHODS */}

                <div className="mt-6 text-xs font-black uppercase tracking-[.18em] text-black/40">
                  Payment method
                </div>

                <div className="mt-3 space-y-2">

                  {(
                    [
                      "GCash",
                      "Maya",
                      "Credit / Debit Card",
                    ] as Payment[]
                  ).map((method) => (

                    <button
                      key={method}
                      onClick={() => setPayment(method)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left font-bold ${
                        payment === method
                          ? "border-[#F67A16] bg-[#FFF2E8]"
                          : "border-black/10 bg-white"
                      }`}
                    >

                      <span>{method}</span>

                      <span
                        className={`h-4 w-4 rounded-full border-4 ${
                          payment === method
                            ? "border-[#F67A16] bg-white"
                            : "border-black/15"
                        }`}
                      />

                    </button>

                  ))}

                </div>

                {/* SUBSCRIBE */}

                <button
                  onClick={() => setStep("success")}
                  className="mt-6 flex h-16 w-full items-center justify-between rounded-2xl bg-[#F67A16] px-5 font-bold text-white"
                >
                  Subscribe for {price}/{cadence}
                  <ArrowUpRight />
                </button>

              </>
            ) : (

              /* ================= SUCCESS ================= */

              <div className="text-center">

                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#F67A16] text-4xl font-black text-white">
                  ✓
                </div>

                <div className="mt-5 text-[10px] font-black uppercase tracking-[.2em] text-[#D95F05]">
                  Demo complete
                </div>

                <h3 className="mt-2 text-4xl font-black tracking-[-.05em]">
                  Welcome to Plus.
                </h3>

                <p className="mx-auto mt-4 max-w-sm text-sm font-medium leading-6 text-black/50">
                  Your sample SignSight Plus subscription is now
                  shown as active. No real payment was made.
                </p>

                <div className="mt-6 rounded-[24px] bg-white p-5 text-left">

                  <div className="flex justify-between gap-4 border-b border-black/10 pb-3">

                    <span className="text-sm text-black/45">
                      Plan
                    </span>

                    <span className="text-sm font-black">
                      SignSight Plus
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 pt-3">

                    <span className="text-sm text-black/45">
                      Billing
                    </span>

                    <span className="text-sm font-black">
                      {price} / {cadence}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() => setStep("idle")}
                  className="mt-6 h-14 w-full rounded-2xl bg-[#202124] font-bold text-white"
                >
                  Continue
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}