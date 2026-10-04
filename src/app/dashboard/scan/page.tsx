"use client";

import { Suspense } from "react";
import ScanContent from "./scan-content";
import { Loader2, QrCode } from "lucide-react";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-16 h-16 rounded-2xl vv-gradient flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading scanner...</p>
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
