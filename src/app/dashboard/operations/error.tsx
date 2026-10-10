"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Next 16.3+: error boundaries receive `retry` (re-fetches and re-renders).
export default function OperationsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Operations dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md pt-12">
      <Card>
        <CardContent
          role="alert"
          className="flex flex-col items-center gap-3 py-6 text-center"
        >
          <AlertTriangle aria-hidden="true" className="size-8 text-vv-warning" />
          <h1 className="text-lg font-semibold">Couldn&apos;t load event operations</h1>
          <p className="text-sm text-muted-foreground">
            The latest numbers couldn&apos;t be fetched. Check your connection and try
            again.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
          )}
          <Button onClick={() => retry()}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
