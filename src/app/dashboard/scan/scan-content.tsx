"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Keyboard, AlertCircle, Loader2, CheckCircle2, RefreshCw } from "lucide-react";

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
        // State 2 = SCANNING
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
      // Navigate to team operations page with the QR token
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

      // Clean up any existing scanner
      await stopScanner();

      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleSuccess,
        () => {
          // Quiet failure during scanning — normal behavior
        }
      );

      setScanState("scanning");
      setScannerReady(true);
    } catch (err: unknown) {
      console.error("QR Scanner error:", err);
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        setErrorMsg("Camera permission denied. Please allow camera access in your browser settings, then try again.");
      } else if (msg.toLowerCase().includes("notfound") || msg.toLowerCase().includes("no camera")) {
        setErrorMsg("No camera found. Please use the Manual Entry tab instead.");
      } else {
        setErrorMsg("Unable to start camera. Please use Manual Entry or check browser permissions.");
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

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Team <span className="vv-gradient-text">Identification</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scan the team QR code or enter the Team ID manually
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary" role="tablist" aria-label="Identification method">
        <button
          id="tab-qr-btn"
          role="tab"
          aria-selected={tab === "qr"}
          onClick={() => switchTab("qr")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "qr"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <QrCode className="w-4 h-4" />
          QR Scanner
        </button>
        <button
          id="tab-manual-btn"
          role="tab"
          aria-selected={tab === "manual"}
          onClick={() => switchTab("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "manual"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Manual Entry
        </button>
      </div>

      {/* ── QR SCANNER TAB ── */}
      {tab === "qr" && (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Camera Scanner</p>
            {(scanState === "scanning" || scanState === "error") && (
              <button
                id="restart-scanner-btn"
                onClick={startScanner}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                aria-label="Restart scanner"
              >
                <RefreshCw className="w-3 h-3" />
                Restart
              </button>
            )}
          </div>

          {/* Scanner viewport */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square w-full max-w-[300px] mx-auto shadow-2xl">
            {/* The actual html5-qrcode mount point */}
            <div id="qr-reader" ref={scannerRef} className="w-full h-full" />

            {/* Corner frame decorators */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-[3px] border-l-[3px] border-primary rounded-tl pointer-events-none" />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-[3px] border-r-[3px] border-primary rounded-tr pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-[3px] border-l-[3px] border-primary rounded-bl pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-[3px] border-r-[3px] border-primary rounded-br pointer-events-none" />

            {/* Animated scan line */}
            {scanState === "scanning" && (
              <div
                className="absolute inset-x-3 h-0.5 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, oklch(0.65 0.22 270), transparent)",
                  animation: "scan-line 2s linear infinite",
                  top: "50%",
                }}
              />
            )}

            {/* Idle overlay */}
            {scanState === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 pointer-events-none">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Starting camera…</p>
              </div>
            )}

            {/* Success overlay */}
            {scanState === "success" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-950/90 gap-3 pointer-events-none">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
                <p className="text-sm text-green-300 font-medium">QR Detected!</p>
                <p className="text-xs text-green-400">Redirecting…</p>
              </div>
            )}

            {/* Error overlay */}
            {scanState === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 gap-3 p-5">
                <AlertCircle className="w-9 h-9 text-red-400" />
                <p className="text-xs text-red-300 text-center leading-relaxed">{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Status text */}
          {scanState === "scanning" && (
            <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Point camera at team QR code
            </p>
          )}

          {/* Error action: switch to manual */}
          {scanState === "error" && (
            <div className="space-y-2">
              <button
                id="retry-camera-btn"
                onClick={startScanner}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all"
              >
                Try Camera Again
              </button>
              <button
                id="switch-to-manual-btn"
                onClick={() => switchTab("manual")}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
              >
                Use Manual Entry Instead
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL ENTRY TAB ── */}
      {tab === "manual" && (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-950/40 border border-yellow-800/40 text-sm text-yellow-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Manual Team ID Entry</p>
              <p className="text-xs text-yellow-400 mt-0.5">
                Use this if QR scanning is unavailable. Format:{" "}
                <code className="font-mono bg-yellow-950/60 px-1 rounded">IDN26-042</code>
              </p>
            </div>
          </div>

          <form onSubmit={handleManualLookup} className="space-y-4" id="manual-lookup-form">
            <div className="space-y-2">
              <label
                htmlFor="team-id-input"
                className="text-sm font-medium text-foreground block"
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
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-lg tracking-widest uppercase text-center"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the exact Team ID as shown on the registration
              </p>
            </div>

            <button
              id="lookup-team-btn"
              type="submit"
              disabled={lookupLoading || !manualId.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm vv-gradient text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {lookupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Looking up team…
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Find Team
                </>
              )}
            </button>
          </form>

          {/* Back to QR */}
          <button
            onClick={() => switchTab("qr")}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            ← Try QR Scanner again
          </button>
        </div>
      )}

      {/* Info tip */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
        <span className="text-primary mt-0.5">💡</span>
        <span>
          Each approved team has a unique secure QR token. Scanning or entering
          the Team ID only <strong>identifies</strong> the team — it does not bypass
          role verification.
        </span>
      </div>
    </div>
  );
}
