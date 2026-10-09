"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Keyboard,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  Camera,
  Crosshair,
  ShieldAlert,
} from "lucide-react";

type ScanState = "idle" | "scanning" | "success" | "error";
type Tab = "qr" | "manual";

export default function ScanContent() {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualId, setManualId] = useState("");
  const [tab, setTab] = useState<Tab>("qr");
  const [lookupLoading, setLookupLoading] = useState(false);

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        const state = html5QrRef.current.getState?.();
        if (state === 2) {
          await html5QrRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      html5QrRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback(
    async (decodedText: string) => {
      setScanState("success");
      await stopScanner();
      router.push(`/dashboard/team?qr=${encodeURIComponent(decodedText)}`);
    },
    [router, stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    setScanState("idle");
    setErrorMsg("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await stopScanner();
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        handleSuccess,
        () => {
          // Normal frame scan
        }
      );

      setScanState("scanning");
    } catch (err: unknown) {
      console.error("QR Scanner error:", err);
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        setErrorMsg(
          "Camera access denied. Please grant camera permission or use the Manual Entry fallback tab."
        );
      } else if (
        msg.toLowerCase().includes("notfound") ||
        msg.toLowerCase().includes("no camera")
      ) {
        setErrorMsg("No active camera found. Use the Manual Entry fallback tab.");
      } else {
        setErrorMsg(
          "Camera initialization error. You can use the Manual Entry tab below."
        );
      }
      setScanState("error");
    }
  }, [handleSuccess, stopScanner]);

  useEffect(() => {
    if (tab !== "qr") {
      stopScanner();
      return;
    }
    startScanner();
    return () => {
      stopScanner();
    };
  }, [tab, startScanner, stopScanner]);

  function switchTab(newTab: Tab) {
    setTab(newTab);
    if (newTab === "qr") {
      setScanState("idle");
      setErrorMsg("");
    }
  }

  async function handleManualLookup(e: React.FormEvent) {
    e.preventDefault();
    const id = manualId.trim().toUpperCase();
    if (!id) return;
    setLookupLoading(true);
    router.push(`/dashboard/team?id=${encodeURIComponent(id)}`);
  }

  function handlePresetId(preset: string) {
    setManualId(preset);
    setLookupLoading(true);
    router.push(`/dashboard/team?id=${encodeURIComponent(preset)}`);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="font-hud text-xs font-bold text-[#FFB800] tracking-widest uppercase">
            DIRECTIVE 01 // TEAM IDENTIFICATION
          </span>
        </div>
        <h1 className="font-gta text-3xl sm:text-4xl text-white tracking-wider uppercase">
          TARGET <span className="vv-gradient-text">TEAM SCANNER</span>
        </h1>
        <p className="font-hud text-xs text-[#A192C2] tracking-wider uppercase">
          Puttashankar Prasad &bull; QR Verification & Entry Fallback Engine
        </p>
      </div>

      {/* ── GTA Mode Toggle Tabs ── */}
      <div className="grid grid-cols-2 p-1.5 rounded-xl bg-[#130924] border border-[#FF2A85]/30">
        <button
          type="button"
          onClick={() => switchTab("qr")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-hud text-xs sm:text-sm font-bold tracking-wider uppercase transition-all ${
            tab === "qr"
              ? "bg-gradient-to-r from-[#FF2A85] to-[#FF0055] text-white shadow-[0_0_15px_rgba(255,42,133,0.5)] border border-[#FF5E9E]"
              : "text-[#A192C2] hover:text-white hover:bg-[#1C0E38]"
          }`}
        >
          <Camera className="w-4 h-4" />
          HUD CAMERA SCAN
        </button>

        <button
          type="button"
          onClick={() => switchTab("manual")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-hud text-xs sm:text-sm font-bold tracking-wider uppercase transition-all ${
            tab === "manual"
              ? "bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#090514] shadow-[0_0_15px_rgba(0,240,255,0.5)] border border-[#70F7FF]"
              : "text-[#A192C2] hover:text-white hover:bg-[#1C0E38]"
          }`}
        >
          <Keyboard className="w-4 h-4" />
          MANUAL ID ENTRY
        </button>
      </div>

      {/* ── Tab 1: Camera Scanner ── */}
      {tab === "qr" && (
        <div className="vv-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-hud text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-[#FF2A85] animate-spin" />
              OPTICAL RETICLE ACTIVE
            </span>
            <span className="font-mono text-[0.6875rem] text-[#FFB800] bg-[#FFB800]/10 px-2 py-0.5 rounded border border-[#FFB800]/30">
              {scanState === "scanning" ? "ACQUIRING..." : scanState.toUpperCase()}
            </span>
          </div>

          {/* Viewfinder Container */}
          <div className="relative aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-[#0A0517] border-2 border-[#FF2A85]/40 shadow-[0_0_25px_rgba(255,42,133,0.2)]">
            {/* HTML5 QR Camera Container */}
            <div id="qr-reader" ref={scannerRef} className="w-full h-full object-cover" />

            {/* GTA HUD Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              {/* Corner Brackets */}
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 border-t-4 border-l-4 border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <div className="w-8 h-8 border-t-4 border-r-4 border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              </div>

              {/* Center Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border border-[#00F0FF]/30 rounded-lg flex items-center justify-center relative">
                  <div className="w-4 h-4 border border-[#FF2A85] rounded-full animate-ping" />
                  {/* Laser Scanline */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent shadow-[0_0_12px_#FF2A85] animate-scan" />
                </div>
              </div>

              {/* Bottom Corner Brackets */}
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 border-b-4 border-l-4 border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <div className="w-8 h-8 border-b-4 border-r-4 border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              </div>
            </div>

            {/* Error Overlay */}
            {scanState === "error" && (
              <div className="absolute inset-0 bg-[#090514]/95 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                <ShieldAlert className="w-12 h-12 text-[#FF2244]" />
                <p className="font-hud text-sm font-bold text-white uppercase tracking-wider">
                  CAMERA SUBSYSTEM OFFLINE
                </p>
                <p className="font-hud text-xs text-[#A192C2] max-w-xs">
                  {errorMsg}
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => startScanner()}
                    className="btn-primary py-2 px-3 text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> RETRY CAMERA
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("manual")}
                    className="btn-cyan py-2 px-3 text-xs"
                  >
                    ENTER TEAM ID
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center font-hud text-xs text-[#A192C2] uppercase tracking-wider">
            Point camera directly at the registered Team Leader&apos;s digital QR badge.
          </p>
        </div>
      )}

      {/* ── Tab 2: Manual Entry Fallback ── */}
      {tab === "manual" && (
        <div className="vv-card p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <span className="font-hud text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
              FALLBACK PROTOCOL // MANUAL REGISTRY
            </span>
            <h2 className="font-gta text-2xl text-white uppercase tracking-wider">
              INPUT REGISTERED TEAM ID
            </h2>
            <p className="font-hud text-xs text-[#A192C2]">
              In accordance with Section 2 of Platform Spec, enter the official Team ID if the camera cannot read the QR token.
            </p>
          </div>

          <form onSubmit={handleManualLookup} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="manual-team-id"
                className="block font-hud text-xs font-bold uppercase tracking-wider text-[#00F0FF]"
              >
                Team Identifier Code
              </label>
              <div className="relative">
                <input
                  id="manual-team-id"
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  placeholder="e.g. IDN26-042"
                  required
                  className="vv-input font-mono text-lg tracking-widest uppercase pl-4 pr-12"
                />
                <Search className="w-5 h-5 text-[#FF2A85] absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={lookupLoading || !manualId.trim()}
              className="btn-cyan w-full py-3 font-hud text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2"
            >
              {lookupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  LOCATING TEAM DOSSIER...
                </>
              ) : (
                "LOCATE TEAM & PROCEED TO OPERATIONS →"
              )}
            </button>
          </form>

          {/* Quick Demo Test Presets */}
          <div className="pt-3 border-t border-[#FF2A85]/20 space-y-2">
            <span className="font-hud text-[0.6875rem] font-bold text-[#FFB800] uppercase tracking-widest">
              QUICK DEMO TEST PRESETS (CLICK TO TEST IMMEDIATELY):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {["IDN26-001", "IDN26-042", "IDN26-099"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetId(preset)}
                  className="py-2 px-2 rounded bg-[#1A0E38] border border-[#FF2A85]/30 hover:border-[#00F0FF] text-white font-mono text-xs font-bold transition-all hover:bg-[#FF2A85]/20 hover:scale-[1.02]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Security Policy Ribbon ── */}
      <div className="p-4 rounded-xl bg-[#120924] border border-[#00F0FF]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00F0FF] flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-hud text-xs font-bold text-white uppercase tracking-wider">
            SECURITY & ROLE GOVERNANCE
          </p>
          <p className="font-hud text-xs text-[#A192C2]">
            Per Section 17, the Team QR or ID only identifies the team. All member activity mutations are verified server-side with duplicate-prevention locks.
          </p>
        </div>
      </div>
    </div>
  );
}
