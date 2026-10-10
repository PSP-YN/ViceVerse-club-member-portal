"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import ViceVerseLogo from "@/components/ViceVerseLogo";

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

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile && profile.role !== "club_member") {
          await supabase.auth.signOut();
          setError("Access denied. This sector is restricted to authorised Club Members only.");
          setLoading(false);
          return;
        }
      }

      // Set cookie for session persistence
      document.cookie = "vv_demo_auth=true; path=/; max-age=86400; SameSite=Lax";
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Connection to auth server failed. Try the Quick Demo Access below.");
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 overflow-hidden bg-[#090514]">
      {/* Background Synthwave Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 42, 133, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
        }}
      />

      {/* Atmospheric Neon Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-r from-[#FF2A85]/20 via-[#FF8C00]/15 to-[#00F0FF]/20 blur-[90px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <ViceVerseLogo size="lg" showSubtitle={false} />
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A0D36] border border-[#FF2A85]/40 text-[#FFB800] text-xs font-hud tracking-wider uppercase shadow-[0_0_12px_rgba(255,42,133,0.2)]">
            <span>WANTED LEVEL</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#FFB800] drop-shadow-[0_0_5px_rgba(255,184,0,0.9)]">★</span>
              ))}
            </div>
            <span className="text-[#00F0FF] font-mono text-[0.65rem] ml-1">CLEARED</span>
          </div>

          <h2 className="font-gta text-2xl text-white tracking-wide uppercase">
            CLUB MEMBER OPERATIONS <span className="vv-gradient-text">PORTAL</span>
          </h2>
          <p className="font-hud text-xs text-[#A192C2] tracking-wider uppercase -mt-1">
            SECTOR 04 // EVENT-DAY DISTRIBUTION & SCANNING
          </p>
        </div>

        {/* Main Login Card */}
        <div className="vv-card p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
          {/* Top Neon Border Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF2A85] via-[#FF8C00] to-[#00F0FF]" />

          <div className="space-y-1">
            <h3 className="font-hud text-lg font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />
              Staff Authentication
            </h3>
            <p className="text-xs text-[#A192C2] font-hud tracking-wide">
              Enter your credentials to access live event scanning & telemetry.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-hud text-xs font-bold uppercase tracking-wider text-[#00F0FF]"
              >
                Operator Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@viceverse.club"
                required
                autoComplete="email"
                className="vv-input font-mono text-sm"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block font-hud text-xs font-bold uppercase tracking-wider text-[#00F0FF]"
              >
                Security Passcode
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="vv-input font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A192C2] hover:text-[#00F0FF] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="flex items-start gap-2.5 p-3 rounded bg-red-950/40 border border-[#FF2244]/60 text-[#FF7088] text-xs font-hud tracking-wide"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF2244]" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-hud font-bold tracking-widest uppercase mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  AUTHENTICATING...
                </>
              ) : (
                "SIGN IN TO PORTAL"
              )}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center space-y-1">
          <p className="font-hud text-xs text-[#A192C2] tracking-wider uppercase">
            VICEVERSE IDEATHON 2026 // CLUB MEMBER PORTAL
          </p>
        </div>
      </div>
    </div>
  );
}
