"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import { clearToken, getToken, setToken, adminLogin } from "../lib/api";

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
  
  return <AdminDashboard onLogout={() => { clearToken(); setTokenState(null); }} />;
}

function Login({ onSuccess }: { onSuccess: (t: string) => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [retrySeconds, setRetrySeconds] = useState(0);

  const submit = async () => {
  if (retrySeconds > 0) return;

  try {
    setErr("");
    setLoading(true);

    const res = await adminLogin(username, password);

    onSuccess(res.token);
  } catch (error: any) {
    if (error.status === 429) {
      const seconds =
        error.retryAfter && error.retryAfter > 0
          ? error.retryAfter
          : 60;

      setRetrySeconds(seconds);
      setErr("");
    } else if (error.status === 401) {
      setErr("Invalid username or password.");
    } else if (error.status === 422) {
      setErr("Please check your username and password.");
    } else {
      setErr("Unable to log in. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
  if (retrySeconds <= 0) return;

  const timer = setInterval(() => {
    setRetrySeconds((prev) => Math.max(prev - 1, 0));
  }, 1000);

  return () => clearInterval(timer);
}, [retrySeconds]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,168,212,0.25),_transparent_30%),radial-gradient(circle_at_20%_70%,_rgba(147,197,253,0.18),_transparent_25%),radial-gradient(circle_at_80%_85%,_rgba(253,230,138,0.22),_transparent_28%),linear-gradient(135deg,_#FFF9F2_0%,_#FFF7ED_45%,_#FDF2F8_100%)] flex items-center justify-center p-6 text-[#1F2937]">
      <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F9A8D4]/30 bg-[#FCE7F3]">
            <span className="font-black text-[#BE185D]">SS</span>
          </div>
          <div>
            <div className="text-lg font-black text-[#1F2937]">SignSight Admin</div>
            <div className="text-sm text-[#6B7280]">Feedback dashboard</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <input
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] outline-none transition focus:border-[#F9A8D4] focus:ring-2 focus:ring-[#FCE7F3]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] outline-none transition focus:border-[#F9A8D4] focus:ring-2 focus:ring-[#FCE7F3]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />

          {retrySeconds > 0 ? (
            <div className="rounded-2xl border border-[#FCA5A5]/40 bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
              Too many login attempts. Try again in{" "}
              <span className="font-bold">
                {retrySeconds} second{retrySeconds !== 1 ? "s" : ""}
              </span>.
            </div>
          ) : (
            !!err && (
              <div className="rounded-2xl border border-[#FCA5A5]/40 bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
                {err}
              </div>
            )
          )}

          <button
            onClick={submit}
            disabled={loading || retrySeconds > 0}
            className="mt-2 w-full rounded-2xl border border-[#F9A8D4]/40 bg-[#F9A8D4]/30 px-4 py-3 font-extrabold text-[#831843] transition hover:bg-[#F9A8D4]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in…"
              : retrySeconds > 0
                ? `Try again in ${retrySeconds}s`
                : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}