"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import {
  clearToken,
  getToken,
  setToken,
  adminLogin,
} from "../lib/api";

export default function HomePage() {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  if (!token) {
    return (
      <Login
        onSuccess={(t) => {
          setToken(t);
          setTokenState(t);
        }}
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={() => {
        clearToken();
        setTokenState(null);
      }}
    />
  );
}

function Login({
  onSuccess,
}: {
  onSuccess: (t: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [retrySeconds, setRetrySeconds] = useState(0);

  useEffect(() => {
    if (retrySeconds <= 0) return;

    const timer = setInterval(() => {
      setRetrySeconds((prev) =>
        Math.max(prev - 1, 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [retrySeconds]);

  const submit = async () => {
    if (retrySeconds > 0) return;

    if (!username.trim() || !password) {
      setErr("Please enter your username and password.");
      return;
    }

    try {
      setErr("");
      setLoading(true);

      const res = await adminLogin(
        username.trim(),
        password
      );

      onSuccess(res.token);
    } catch (error: any) {
      if (error.status === 429) {
        setRetrySeconds(
          error.retryAfter > 0
            ? error.retryAfter
            : 60
        );

        setErr("");
      } else if (error.status === 401) {
        setErr("Invalid username or password.");
      } else {
        setErr(
          "Unable to connect to SignSight. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EC] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      {/* ========================= */}
      {/* LEFT BRAND PANEL */}
      {/* ========================= */}

      <section className="relative hidden min-h-screen overflow-hidden bg-[#176B49] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border-[70px] border-white/5" />

          <div className="absolute bottom-[-130px] right-[-100px] h-[420px] w-[420px] rounded-full bg-[#D89A18]/15 blur-2xl" />

          <div className="absolute right-[15%] top-[18%] h-20 w-20 rotate-12 rounded-[28px] border border-white/10" />

          <div className="absolute bottom-[24%] left-[12%] h-28 w-28 -rotate-12 rounded-full border border-[#E7AC25]/20" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFF8E7] shadow-lg">
              <span className="text-xl font-black text-[#176B49]">
                SS
              </span>
            </div>

            <div className="leading-none">
              <div className="text-2xl font-black tracking-tight text-white">
                SIGN
              </div>

              <div className="mt-1 text-2xl font-black tracking-tight text-[#E7AC25]">
                SIGHT
              </div>
            </div>
          </div>
        </div>

        {/* Main hero */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#FFF1BE] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#E7AC25]" />
            ADMINISTRATION SYSTEM
          </div>

          <h1 className="max-w-lg text-5xl font-black leading-[1.06] tracking-[-0.055em] text-white xl:text-6xl">
            Manage the voice behind
            <span className="text-[#F2B941]">
              {" "}SignSight.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/65">
            Review user feedback, manage reports,
            and keep track of important system
            activity from one secure workspace.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7AC25]/15 text-[#FFD76F]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3h6m-9.75 8.25l2.1-3.15A8.25 8.25 0 1119.5 12"
                  />
                </svg>
              </div>

              <p className="text-sm font-bold text-white">
                Feedback
              </p>

              <p className="mt-1 text-xs leading-5 text-white/45">
                Review user reports
              </p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7AC25]/15 text-[#FFD76F]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75h6M9 10.5h6m-6 3.75h3.75M6.75 3.75h10.5A2.25 2.25 0 0119.5 6v12a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V6a2.25 2.25 0 012.25-2.25z"
                  />
                </svg>
              </div>

              <p className="text-sm font-bold text-white">
                Audit Trail
              </p>

              <p className="mt-1 text-xs leading-5 text-white/45">
                Track activity
              </p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7AC25]/15 text-[#FFD76F]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75l2.25 2.25L15 9.75m6-3.75c-4.5 0-7.5-1.5-9-3-1.5 1.5-4.5 3-9 3 0 7.5 3 12 9 15 6-3 9-7.5 9-15z"
                  />
                </svg>
              </div>

              <p className="text-sm font-bold text-white">
                Secure
              </p>

              <p className="mt-1 text-xs leading-5 text-white/45">
                Protected access
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-white/40">
          <span>SignSight Administration</span>
          <span>Communication without barriers</span>
        </div>
      </section>

      {/* ========================= */}
      {/* RIGHT LOGIN SIDE */}
      {/* ========================= */}

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 sm:px-10 lg:px-12">
        {/* background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-150px] top-[-100px] h-[400px] w-[400px] rounded-full bg-[#F5D57C]/20 blur-3xl" />

          <div className="absolute bottom-[-180px] left-[-150px] h-[400px] w-[400px] rounded-full bg-[#86C8A7]/15 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[460px]">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#176B49]">
              <span className="font-black text-white">
                SS
              </span>
            </div>

            <div>
              <div className="font-black leading-none text-[#176B49]">
                SIGN
              </div>

              <div className="mt-1 font-black leading-none text-[#D89A18]">
                SIGHT
              </div>
            </div>
          </div>

          <div className="mb-9">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C48A11]">
              Admin Login
            </p>

            <h2 className="text-[40px] font-black leading-tight tracking-[-0.055em] text-[#17382B]">
              Welcome back.
            </h2>

            <p className="mt-3 max-w-sm text-[15px] leading-6 text-[#7A786F]">
              Enter your administrator credentials to
              continue to the SignSight dashboard.
            </p>
          </div>

          <div className="space-y-5">
            {/* Username */}
            <div>
              <label className="mb-2.5 block text-[13px] font-extrabold text-[#34463E]">
                Username
              </label>

              <div className="flex items-center rounded-[18px] border border-[#DDD9CC] bg-white px-4 shadow-[0_5px_20px_rgba(38,65,50,0.04)] transition duration-200 focus-within:border-[#176B49] focus-within:shadow-[0_0_0_4px_rgba(23,107,73,0.09)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 shrink-0 text-[#9A9A91]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                  />
                </svg>

                <input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full bg-transparent px-3 py-4 text-[15px] font-semibold text-[#263B31] outline-none placeholder:font-medium placeholder:text-[#B3B2AA]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2.5 block text-[13px] font-extrabold text-[#34463E]">
                Password
              </label>

              <div className="flex items-center rounded-[18px] border border-[#DDD9CC] bg-white px-4 shadow-[0_5px_20px_rgba(38,65,50,0.04)] transition duration-200 focus-within:border-[#176B49] focus-within:shadow-[0_0_0_4px_rgba(23,107,73,0.09)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 shrink-0 text-[#9A9A91]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-6a2.25 2.25 0 012.25-2.25z"
                  />
                </svg>

                <input
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  className="w-full bg-transparent px-3 py-4 text-[15px] font-semibold text-[#263B31] outline-none placeholder:font-medium placeholder:text-[#B3B2AA]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="rounded-xl px-2.5 py-2 text-xs font-extrabold text-[#A67812] transition hover:bg-[#FFF3D2]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {retrySeconds > 0 ? (
              <div className="rounded-[18px] border border-[#E9C66D] bg-[#FFF5D9] px-4 py-3.5">
                <p className="text-sm font-extrabold text-[#8A6107]">
                  Login temporarily locked
                </p>

                <p className="mt-1 text-xs leading-5 text-[#A47A1A]">
                  Too many attempts. Try again in{" "}
                  {retrySeconds} second
                  {retrySeconds !== 1 ? "s" : ""}.
                </p>
              </div>
            ) : (
              err && (
                <div className="rounded-[18px] border border-[#F0C6A7] bg-[#FFF1E8] px-4 py-3.5 text-sm font-semibold text-[#A34C1F]">
                  {err}
                </div>
              )
            )}

            {/* Button */}
            <button
              onClick={submit}
              disabled={
                loading || retrySeconds > 0
              }
              className="group flex w-full items-center justify-between rounded-[18px] bg-[#176B49] px-5 py-4 text-left text-sm font-black text-white shadow-[0_12px_30px_rgba(23,107,73,0.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#125B3D] hover:shadow-[0_16px_36px_rgba(23,107,73,0.26)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Signing in..."
                  : retrySeconds > 0
                    ? `Try again in ${retrySeconds}s`
                    : "Continue to dashboard"}
              </span>

              {!loading && retrySeconds <= 0 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition group-hover:translate-x-1 group-hover:bg-[#E7AC25]">
                  →
                </span>
              )}

              {loading && (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
            </button>
          </div>

          {/* Security section */}
          <div className="mt-8 flex items-center gap-3 rounded-[18px] border border-[#E4E0D5] bg-white/50 px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E7F2EC] text-[#176B49]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75l2.25 2.25L15 9.75m6-3.75c-4.5 0-7.5-1.5-9-3-1.5 1.5-4.5 3-9 3 0 7.5 3 12 9 15 6-3 9-7.5 9-15z"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs font-extrabold text-[#3C4A43]">
                Secure administrator access
              </p>

              <p className="mt-0.5 text-[11px] leading-5 text-[#8C8A82]">
                Protected by SignSight authentication
                and session security.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}