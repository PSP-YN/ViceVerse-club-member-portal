import { Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITY_META, EVENT_TIME_ZONE } from "@/lib/operations/config";
import { formatRelativeTime, type AuditRow } from "@/lib/operations/summary";

const absoluteFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: EVENT_TIME_ZONE,
});

function actionText(log: AuditRow): string {
  const meta = ACTIVITY_META[log.activity];
  if (log.action === "marked_complete") return meta.completedText;
  return `${meta.label} · ${log.action.replace(/_/g, " ")}`;
}

interface RecentActivityProps {
  logs: AuditRow[];
  now: Date;
}

/**
 * Latest audit_logs entries. Shows who did what and when; it deliberately
 * does not select or display emails, phone numbers or user IDs.
 */
export function RecentActivity({ logs, now }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Recent Activity</h2>
        </CardTitle>
        <CardDescription>Latest actions recorded by Club Members</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Activity aria-hidden="true" className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            <p className="text-xs text-muted-foreground">
              Actions will appear here as soon as Club Members start processing teams.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((log) => {
              const Icon = ACTIVITY_META[log.activity].icon;
              return (
                <li key={log.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  >
                    <Icon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={log.team?.team_name}>
                      Team <span className="font-mono">{log.team?.team_id ?? "Unknown"}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-sm">
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-vv-success"
                      />
                      <span className="truncate">{actionText(log)}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {log.member?.name ?? "Unknown member"}
                      {log.performed_by_name ? ` · by ${log.performed_by_name}` : ""}
                    </p>
                  </div>

                  <time
                    dateTime={log.timestamp}
                    title={absoluteFormat.format(new Date(log.timestamp))}
                    className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground"
                  >
                    {formatRelativeTime(log.timestamp, now)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
