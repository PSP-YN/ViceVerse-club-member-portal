import { cn } from "@/lib/utils";
import { LIVE_WINDOW_MINUTES } from "@/lib/operations/config";
import type { OperationsState } from "@/lib/operations/summary";

const STATE_UI: Record<
  OperationsState,
  { label: string; description: string; dot: string; pulse?: boolean }
> = {
  live: {
    label: "LIVE",
    description: `Activity recorded in the last ${LIVE_WINDOW_MINUTES} minutes`,
    dot: "bg-vv-success",
    pulse: true,
  },
  standby: {
    label: "STANDBY",
    description: `No activity recorded in the last ${LIVE_WINDOW_MINUTES} minutes`,
    dot: "bg-vv-warning",
  },
  not_started: {
    label: "NOT STARTED",
    description: "No event-day activity recorded yet",
    dot: "bg-muted-foreground",
  },
  complete: {
    label: "COMPLETE",
    description: "Every activity is complete for all members",
    dot: "bg-primary",
  },
  no_teams: {
    label: "NO TEAMS",
    description: "No approved teams with members yet",
    dot: "bg-muted-foreground",
  },
};

/** Operating state, derived from existing data (see deriveState). */
export function StatusBadge({ state }: { state: OperationsState }) {
  const ui = STATE_UI[state];

  return (
    <span
      role="status"
      title={ui.description}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold tracking-wide"
    >
      <span className="relative flex size-2" aria-hidden="true">
        {ui.pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping",
              ui.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex size-2 rounded-full", ui.dot)} />
      </span>
      <span className="sr-only">Event operations status: </span>
      {ui.label}
      <span className="sr-only">. {ui.description}</span>
    </span>
  );
}
