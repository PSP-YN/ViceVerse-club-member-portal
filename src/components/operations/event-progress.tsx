import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ACTIVITIES, ACTIVITY_META } from "@/lib/operations/config";
import type { OperationsSummary } from "@/lib/operations/summary";

export function EventProgress({ summary }: { summary: OperationsSummary }) {
  const hasMembers = summary.totalMembers > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Event Progress</h2>
        </CardTitle>
        <CardDescription>Members who have completed each activity</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasMembers ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No members found for approved teams yet.
          </p>
        ) : (
          <ul className="space-y-5">
            {ACTIVITIES.map((activity) => {
              const { label, icon: Icon } = ACTIVITY_META[activity];
              const progress = summary.activities[activity];
              const done = progress.completed >= progress.total;

              return (
                <li key={activity}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                      {label}
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {progress.percent}%
                    </span>
                  </div>
                  <Progress
                    value={progress.completed}
                    max={progress.total}
                    aria-label={`${label} progress`}
                    className="mt-2"
                    indicatorClassName={done ? "bg-vv-success" : undefined}
                  />
                  <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                    {progress.completed} / {progress.total} members
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
