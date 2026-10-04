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
  ChevronRight,
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
  const [scannerReady, setScannerReady] = useState(false);

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
    setScannerReady(false);
    setScanState("idle");
    setErrorMsg("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await stopScanner();
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        handleSuccess,
        () => {
          // Quiet failure during scanning — normal
        }
      );

      setScanState("scanning");
      setScannerReady(true);
    } catch (err: unknown) {
      console.error("QR Scanner error:", err);
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        setErrorMsg(
          "Camera permission denied. Allow camera access in your browser settings."
        );
      } else if (
        msg.toLowerCase().includes("notfound") ||
        msg.toLowerCase().includes("no camera")
      ) {
        setErrorMsg("No camera found. Use the Manual Entry tab instead.");
      } else {
        setErrorMsg(
          "Unable to start camera. Use Manual Entry or check browser permissions."
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
    return () => { stopScanner(); };
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

  // suppress unused warning
  void scannerReady;

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-up">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label">Identification</span>
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.025em" }}
        >
          Team{" "}
          <span className="vv-gradient-text">Scanner</span>
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "oklch(0.50 0.018 240)" }}>
          Scan a QR code or enter the Team ID manually
        </p>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex gap-1 p-1 rounded"
        style={{ background: "oklch(0.12 0.012 240)", border: "1px solid oklch(0.20 0.012 240)" }}
        role="tablist"
        aria-label="Identification method"
      >
        {(["qr", "manual"] as Tab[]).map((t) => {
          const isActive = tab === t;
          const Icon = t === "qr" ? QrCode : Keyboard;
          const label = t === "qr" ? "QR Scanner" : "Manual Entry";
          return (
            <button
              key={t}
              id={`tab-${t}-btn`}
              role="tab"
              aria-selected={isActive}
              onClick={() => switchTab(t)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all"
              style={{
                background: isActive ? "oklch(0.155 0.012 240)" : "transparent",
                color: isActive ? "oklch(0.88 0.01 240)" : "oklch(0.48 0.018 240)",
                border: isActive ? "1px solid oklch(0.24 0.012 240)" : "1px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── QR SCANNER TAB ── */}
      {tab === "qr" && (
        <div
          className="rounded overflow-hidden"
          style={{
            background: "oklch(0.12 0.012 240)",
            border: "1px solid oklch(0.20 0.012 240)",
          }}
        >
          {/* Header row */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5" style={{ color: "oklch(0.76 0.17 52)" }} />
              <span className="text-sm font-medium" style={{ color: "oklch(0.75 0.01 240)" }}>
                Camera Scanner
              </span>
            </div>
            {(scanState === "scanning" || scanState === "error") && (
              <button
                id="restart-scanner-btn"
                onClick={startScanner}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "oklch(0.50 0.018 240)" }}
                aria-label="Restart scanner"
              >
                <RefreshCw className="w-3 h-3" />
                Restart
              </button>
            )}
          </div>

          {/* Scanner viewport */}
          <div className="p-4">
            <div
              className="relative rounded overflow-hidden bg-black mx-auto"
              style={{ width: "100%", maxWidth: "300px", aspectRatio: "1 / 1" }}
            >
              {/* html5-qrcode mount */}
              <div id="qr-reader" ref={scannerRef} className="w-full h-full" />

              {/* Corner brackets — engineering style */}
              {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                <div
                  key={pos}
                  className="absolute pointer-events-none"
                  style={{
                    top: pos.startsWith("t") ? "10px" : "auto",
                    bottom: pos.startsWith("b") ? "10px" : "auto",
                    left: pos.endsWith("l") ? "10px" : "auto",
                    right: pos.endsWith("r") ? "10px" : "auto",
                    width: "20px",
                    height: "20px",
                    borderTop: pos.startsWith("t") ? "2px solid oklch(0.76 0.17 52)" : "none",
                    borderBottom: pos.startsWith("b") ? "2px solid oklch(0.76 0.17 52)" : "none",
                    borderLeft: pos.endsWith("l") ? "2px solid oklch(0.76 0.17 52)" : "none",
                    borderRight: pos.endsWith("r") ? "2px solid oklch(0.76 0.17 52)" : "none",
                  }}
                />
              ))}

              {/* Scan line */}
              {scanState === "scanning" && (
                <div
                  className="absolute inset-x-3 h-px pointer-events-none animate-scan"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, oklch(0.82 0.17 52), transparent)",
                    boxShadow: "0 0 8px oklch(0.76 0.17 52 / 0.5)",
                  }}
                />
              )}

              {/* Idle overlay */}
              {scanState === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 pointer-events-none">
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: "oklch(0.76 0.17 52)" }} />
                  <p className="text-xs" style={{ color: "oklch(0.50 0.018 240)" }}>
                    Starting camera…
                  </p>
                </div>
              )}

              {/* Success overlay */}
              {scanState === "success" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                  style={{ background: "oklch(0.12 0.012 240 / 0.92)" }}>
                  <CheckCircle2 className="w-10 h-10" style={{ color: "oklch(0.68 0.18 150)" }} />
                  <p className="text-sm font-semibold" style={{ color: "oklch(0.72 0.18 150)" }}>
                    QR Detected
                  </p>
                  <p className="text-xs" style={{ color: "oklch(0.52 0.018 240)" }}>
                    Redirecting…
                  </p>
                </div>
              )}

              {/* Error overlay */}
              {scanState === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5"
                  style={{ background: "oklch(0.10 0.012 240 / 0.95)" }}>
                  <AlertTriangle className="w-8 h-8" style={{ color: "oklch(0.68 0.22 22)" }} />
                  <p className="text-xs text-center leading-relaxed" style={{ color: "oklch(0.62 0.18 22)" }}>
                    {errorMsg}
                  </p>
                </div>
              )}
            </div>

            {/* Status text */}
            {scanState === "scanning" && (
              <p className="text-center text-xs mt-3 flex items-center justify-center gap-2"
                style={{ color: "oklch(0.50 0.018 240)" }}>
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-soft-pulse"
                  style={{ background: "oklch(0.68 0.18 150)" }}
                />
                Point camera at team QR code
              </p>
            )}

            {/* Error recovery buttons */}
            {scanState === "error" && (
              <div className="mt-3 space-y-2">
                <button
                  id="retry-camera-btn"
                  onClick={startScanner}
                  className="w-full py-2.5 rounded text-sm font-medium transition-all"
                  style={{
                    background: "oklch(0.76 0.17 52 / 0.08)",
                    border: "1px solid oklch(0.76 0.17 52 / 0.3)",
                    color: "oklch(0.82 0.17 52)",
                  }}
                >
                  Try Camera Again
                </button>
                <button
                  id="switch-to-manual-btn"
                  onClick={() => switchTab("manual")}
                  className="btn-ghost w-full justify-center"
                >
                  Use Manual Entry Instead
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MANUAL ENTRY TAB ── */}
      {tab === "manual" && (
        <div
          className="rounded overflow-hidden"
          style={{
            background: "oklch(0.12 0.012 240)",
            border: "1px solid oklch(0.20 0.012 240)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
          >
            <Keyboard className="w-3.5 h-3.5" style={{ color: "oklch(0.76 0.17 52)" }} />
            <span className="text-sm font-medium" style={{ color: "oklch(0.75 0.01 240)" }}>
              Manual Team ID
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Info note */}
            <div
              className="flex items-start gap-2.5 px-3 py-2.5 rounded text-xs"
              style={{
                background: "oklch(0.76 0.17 52 / 0.06)",
                border: "1px solid oklch(0.76 0.17 52 / 0.2)",
                color: "oklch(0.78 0.17 52)",
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <div>
                Use this if QR scanning is unavailable. Format:{" "}
                <code
                  className="font-mono px-1 rounded text-xs"
                  style={{ background: "oklch(0.76 0.17 52 / 0.12)" }}
                >
                  IDN26-042
                </code>
              </div>
            </div>

            <form onSubmit={handleManualLookup} className="space-y-3" id="manual-lookup-form">
              <div className="space-y-1.5">
                <label
                  htmlFor="team-id-input"
                  className="block text-xs font-medium"
                  style={{ color: "oklch(0.60 0.018 240)" }}
                >
                  Team ID
                </label>
                <input
                  id="team-id-input"
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  placeholder="IDN26-042"
                  required
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  className="vv-input font-mono text-xl tracking-[0.12em] text-center"
                />
                <p className="text-xs text-center" style={{ color: "oklch(0.42 0.018 240)" }}>
                  Enter the exact Team ID as shown on registration
                </p>
              </div>

              <button
                id="lookup-team-btn"
                type="submit"
                disabled={lookupLoading || !manualId.trim()}
                className="btn-primary w-full justify-center"
              >
                {lookupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Looking up team…
                  </>
                ) : (
                  <>
                    Find Team
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => switchTab("qr")}
              className="w-full text-xs transition-colors py-1"
              style={{ color: "oklch(0.42 0.018 240)" }}
            >
              ← Try QR Scanner again
            </button>
          </div>
        </div>
      )}

      {/* ── Security note ── */}
      <div
        className="flex items-start gap-2.5 px-3 py-3 rounded text-xs"
        style={{
          background: "oklch(0.12 0.012 240)",
          border: "1px solid oklch(0.185 0.012 240)",
          borderLeft: "2px solid oklch(0.62 0.18 185)",
        }}
      >
        <span style={{ color: "oklch(0.62 0.18 185)" }}>ℹ</span>
        <span style={{ color: "oklch(0.48 0.018 240)" }}>
          Each approved team has a unique QR token. Scanning or entering the Team ID only{" "}
          <strong style={{ color: "oklch(0.65 0.01 240)" }}>identifies</strong> the team —
          it does not bypass role verification.
        </span>
      </div>
    </div>
  );
}
