import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationsSummary } from "@/lib/operations/summary";

/**
 * Teams that still have unregistered members. Each row opens the existing
 * Team Lookup page, so no new lookup or write logic lives here.
 */
export function AwaitingCheckin({ summary }: { summary: OperationsSummary }) {
  const hiddenCount = summary.pendingTeamCount - summary.pendingTeams.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Awaiting Check-in</h2>
        </CardTitle>
        <CardDescription>
          {summary.pendingTeamCount === 0
            ? "Teams with members not yet registered"
            : `${summary.pendingTeamCount} ${summary.pendingTeamCount === 1 ? "team has" : "teams have"} members not yet registered`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary.pendingTeams.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {summary.totalMembers === 0
              ? "No approved teams yet."
              : "Every team is checked in."}
          </p>
        ) : (
          <>
            <ul className="-mx-2">
              {summary.pendingTeams.map((team) => (
                <li key={team.id}>
                  <Link
                    href={`/dashboard/team?id=${encodeURIComponent(team.teamId)}`}
                    className="flex items-center gap-3 rounded-md px-2 py-2 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{team.teamName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {team.teamId}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {team.pendingMembers} of {team.memberCount} pending
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                +{hiddenCount} more {hiddenCount === 1 ? "team" : "teams"}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
