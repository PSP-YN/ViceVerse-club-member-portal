import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACTIVITIES, ACTIVITY_META } from "@/lib/operations/config";
import type { OperationsSummary } from "@/lib/operations/summary";

export function PendingOperations({ summary }: { summary: OperationsSummary }) {
  const hasMembers = summary.totalMembers > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Pending Operations</h2>
        </CardTitle>
        <CardDescription>Members still waiting, by activity</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasMembers ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing pending — no members found for approved teams yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {ACTIVITIES.map((activity) => {
              const { label, icon: Icon } = ACTIVITY_META[activity];
              const { pending } = summary.activities[activity];
              const clear = pending === 0;

              return (
                <li
                  key={activity}
                  className={cn(
                    "rounded-lg border p-3",
                    clear ? "border-border" : "border-vv-warning/30 bg-vv-warning/5"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon aria-hidden="true" className="size-4" />
                    {label}
                  </div>
                  {clear ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-vv-success">
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                      All done
                    </p>
                  ) : (
                    <p className="mt-2">
                      <span className="text-2xl font-semibold tabular-nums text-vv-warning">
                        {pending}
                      </span>{" "}
                      <span className="text-sm text-muted-foreground">pending</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
