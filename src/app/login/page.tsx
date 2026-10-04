"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid credentials. Please check your email and password.");
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile || profile.role !== "club_member") {
        await supabase.auth.signOut();
        setError("Access denied. This portal is for authorised Club Members only.");
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-stretch">
      {/* ── Left: Branding Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: "oklch(0.095 0.012 240)" }}
      >
        {/* Technical grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.76 0.17 52) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.76 0.17 52) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Subtle amber gradient corner */}
        <div
          className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 0% 100%, oklch(0.76 0.17 52 / 0.12) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            {/* Engineering hex emblem */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <polygon
                points="18,2 34,10 34,26 18,34 2,26 2,10"
                fill="none"
                stroke="oklch(0.76 0.17 52)"
                strokeWidth="1.5"
              />
              <polygon
                points="18,8 28,13.5 28,24.5 18,30 8,24.5 8,13.5"
                fill="oklch(0.76 0.17 52 / 0.1)"
                stroke="oklch(0.76 0.17 52 / 0.4)"
                strokeWidth="1"
              />
              <text x="18" y="22" textAnchor="middle" fill="oklch(0.82 0.17 52)" fontSize="10" fontWeight="700" fontFamily="Inter">V</text>
            </svg>
            <div>
              <p className="text-base font-bold tracking-tight" style={{ color: "oklch(0.94 0.008 240)" }}>
                ViceVerse
              </p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.018 240)" }}>
                Engineering Ideathon 2026
              </p>
            </div>
          </div>

          <h1
            className="text-4xl font-bold leading-tight mb-4"
            style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.03em" }}
          >
            Club Member
            <br />
            <span className="vv-gradient-text">Operations Portal</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.52 0.018 240)" }}>
            Authorised access for event-day club members.
            Manage team registrations, QR scanning, and distribution tracking.
          </p>
        </div>

        {/* Stat chips */}
        <div className="relative z-10 space-y-3">
          {[
            { label: "Event Status", value: "Active", dot: "bg-green-500" },
            { label: "Access Level", value: "Club Member", dot: "bg-amber-500" },
            { label: "Portal Version", value: "v2.0", dot: "bg-teal-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-4 py-2.5 rounded"
              style={{
                background: "oklch(0.12 0.012 240)",
                border: "1px solid oklch(0.20 0.012 240)",
              }}
            >
              <span className="text-xs" style={{ color: "oklch(0.50 0.018 240)" }}>
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-soft-pulse`} />
                <span className="text-xs font-medium" style={{ color: "oklch(0.82 0.17 52)" }}>
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px] animate-fade-up">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" fill="none" stroke="oklch(0.76 0.17 52)" strokeWidth="1.5"/>
              <text x="18" y="22" textAnchor="middle" fill="oklch(0.82 0.17 52)" fontSize="10" fontWeight="700" fontFamily="Inter">V</text>
            </svg>
            <div>
              <p className="text-sm font-bold" style={{ color: "oklch(0.94 0.008 240)" }}>ViceVerse</p>
              <p className="text-xs" style={{ color: "oklch(0.50 0.018 240)" }}>Club Member Portal</p>
            </div>
          </div>

          {/* Form heading */}
          <div className="mb-7">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.025em" }}
            >
              Sign In
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.50 0.018 240)" }}>
              Authorised Club Members only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium"
                style={{ color: "oklch(0.70 0.018 240)" }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
                autoComplete="email"
                className="vv-input"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium"
                style={{ color: "oklch(0.70 0.018 240)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="vv-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "oklch(0.45 0.012 240)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div
                className="flex items-start gap-2.5 p-3 rounded text-sm"
                style={{
                  background: "oklch(0.58 0.22 22 / 0.08)",
                  border: "1px solid oklch(0.58 0.22 22 / 0.3)",
                  color: "oklch(0.72 0.22 22)",
                }}
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating…
                </>
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            className="mt-8 pt-6"
            style={{ borderTop: "1px solid oklch(0.18 0.012 240)" }}
          >
            <p className="text-xs text-center" style={{ color: "oklch(0.38 0.012 240)" }}>
              ViceVerse Ideathon Management Platform — Team 4 &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
