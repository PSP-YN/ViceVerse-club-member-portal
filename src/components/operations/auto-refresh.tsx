"use client";

import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutoRefreshProps {
  intervalSeconds: number;
  /** Preformatted on the server so server and client always agree. */
  updatedLabel: string;
}

/**
 * Re-runs the server component on an interval so the numbers stay current
 * without a manual reload. Pauses while the tab is hidden and refreshes as
 * soon as it becomes visible again.
 */
export function AutoRefresh({ intervalSeconds, updatedLabel }: AutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, intervalSeconds * 1000);

    function handleVisibility() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalSeconds, refresh]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span aria-live="polite">Updated {updatedLabel} IST</span>
      <span className="hidden sm:inline" aria-hidden="true">
        ·
      </span>
      <span className="hidden sm:inline">Refreshes every {intervalSeconds}s</span>
      <Button variant="ghost" size="xs" onClick={refresh} disabled={isPending}>
        <RefreshCw aria-hidden="true" className={isPending ? "animate-spin" : undefined} />
        Refresh now
      </Button>
    </div>
  );
}
