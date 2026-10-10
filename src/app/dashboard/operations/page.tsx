import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClubMemberAccess, getOperationsSnapshot } from "@/lib/operations/data";
import { ACTIVITIES, ACTIVITY_META, EVENT_TIME_ZONE } from "@/lib/operations/config";
import { AccessRestricted } from "@/components/operations/access-restricted";
import { AwaitingCheckin } from "@/components/operations/awaiting-checkin";
import { EventProgress } from "@/components/operations/event-progress";
import { MetricCard } from "@/components/operations/metric-card";
import { OperationsHeader } from "@/components/operations/operations-header";
import { PendingOperations } from "@/components/operations/pending-operations";
import { RecentActivity } from "@/components/operations/recent-activity";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event Operations | ViceVerse Club Member Portal",
};

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZone: EVENT_TIME_ZONE,
});

export default async function OperationsPage() {
  const supabase = await createClient();

  // Server-side role check — nothing below runs for non-Club Members.
  const access = await getClubMemberAccess(supabase);
  if (access.status === "unauthenticated") redirect("/login");
  if (access.status === "forbidden") return <AccessRestricted />;

  // Failures throw to ./error.tsx instead of rendering misleading zeros.
  const { summary, recentLogs, generatedAt } = await getOperationsSnapshot(supabase);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <OperationsHeader
        member={access.member}
        state={summary.state}
        updatedLabel={timeFormat.format(generatedAt)}
      />

      {/* Key metrics */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard
            className="col-span-2 lg:col-span-1"
            label="Teams Processed"
            icon={Users}
            completed={summary.teams.processed}
            total={summary.teams.total}
            supporting="Every member registered"
          />
          {ACTIVITIES.map((activity) => {
            const { metricLabel, icon } = ACTIVITY_META[activity];
            const progress = summary.activities[activity];
            return (
              <MetricCard
                key={activity}
                label={metricLabel}
                icon={icon}
                completed={progress.completed}
                total={progress.total}
                supporting={
                  progress.total === 0
                    ? "No members yet"
                    : progress.pending === 0
                      ? "All members done"
                      : `${progress.pending} still pending`
                }
              />
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <EventProgress summary={summary} />
        </div>
        <div className="lg:col-span-5">
          <PendingOperations summary={summary} />
        </div>
        <div className="lg:col-span-7">
          <RecentActivity logs={recentLogs} now={generatedAt} />
        </div>
        <div className="lg:col-span-5">
          <AwaitingCheckin summary={summary} />
        </div>
      </div>
    </div>
  );
}
