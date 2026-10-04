"use client";

import { Suspense } from "react";
import TeamPageContent from "./team-content";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-16 h-16 rounded-2xl vv-gradient flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading team data...</p>
        </div>
      }
    >
      <TeamPageContent />
    </Suspense>
  );
}
