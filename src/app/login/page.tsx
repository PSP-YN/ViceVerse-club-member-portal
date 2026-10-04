"use client";

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "oklch(0.09 0.01 240)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <polygon
              points="18,2 34,10 34,26 18,34 2,26 2,10"
              fill="none"
              stroke="oklch(0.76 0.17 52)"
              strokeWidth="1.5"
            />
            <text
              x="18"
              y="22"
              textAnchor="middle"
              fill="oklch(0.82 0.17 52)"
              fontSize="11"
              fontWeight="700"
              fontFamily="system-ui"
            >
              V
            </text>
          </svg>
          <div>
            <p
              className="text-sm font-bold leading-tight"
              style={{ color: "oklch(0.92 0.008 240)", letterSpacing: "-0.02em" }}
            >
              ViceVerse
            </p>
            <p className="text-xs leading-tight" style={{ color: "oklch(0.45 0.018 240)" }}>
              Club Member Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-6"
          style={{
            background: "oklch(0.12 0.012 240)",
            border: "1px solid oklch(0.20 0.012 240)",
          }}
        >
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: "oklch(0.93 0.008 240)", letterSpacing: "-0.02em" }}
          >
            Sign in
          </h1>
          <p className="text-sm mb-5" style={{ color: "oklch(0.48 0.018 240)" }}>
            Authorised club members only
          </p>

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium"
                style={{ color: "oklch(0.65 0.018 240)" }}
              >
                Email
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
                style={{ color: "oklch(0.65 0.018 240)" }}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "oklch(0.40 0.012 240)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 p-3 rounded text-sm"
                style={{
                  background: "oklch(0.58 0.22 22 / 0.07)",
                  border: "1px solid oklch(0.58 0.22 22 / 0.3)",
                  color: "oklch(0.70 0.22 22)",
                }}
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              style={{ marginTop: "0.25rem" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p
          className="text-xs text-center mt-5"
          style={{ color: "oklch(0.32 0.012 240)" }}
        >
          ViceVerse Ideathon 2026 &mdash; Club Member Portal
        </p>
      </div>
    </div>
  );
}
