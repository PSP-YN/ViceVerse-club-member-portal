import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  Users,
  CheckCircle2,
  Gift,
  Coffee,
  Cookie,
  Clock,
  UserCheck,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Operations Status | ViceVerse Club Member Portal",
};

async function getOperationsData() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, team_id, registration_status, goodies_status, lunch_status, snacks_status");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, team_id, team_name")
    .eq("payment_status", "approved");

  const { data: recentLogs } = await supabase
    .from("audit_logs")
    .select("id, performed_by_name, activity, timestamp, member_id")
    .order("timestamp", { ascending: false })
    .limit(15);

  const totalMembers = members?.length ?? 0;
  const totalTeams = teams?.length ?? 0;

  const registered = members?.filter((m) => m.registration_status).length ?? 0;
  const goodies = members?.filter((m) => m.goodies_status).length ?? 0;
  const lunch = members?.filter((m) => m.lunch_status).length ?? 0;
  const snacks = members?.filter((m) => m.snacks_status).length ?? 0;

  const membersByTeam = members?.reduce(
    (acc, m) => {
      acc[m.team_id] = acc[m.team_id] || [];
      acc[m.team_id].push(m);
      return acc;
    },
    {} as Record<string, typeof members>
  );

  const pendingRegistrations =
    teams?.filter((t) => {
      const teamMembers = membersByTeam?.[t.id] ?? [];
      return teamMembers.some((m) => !m.registration_status);
    }) ?? [];

  return {
    totalTeams,
    totalMembers,
    registered,
    goodies,
    lunch,
    snacks,
    recentLogs: recentLogs ?? [],
    pendingRegistrations,
  };
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-base font-bold" style={{ color: "oklch(0.92 0.008 240)", letterSpacing: "-0.02em" }}>
          {value}
          <span className="text-xs font-normal ml-1" style={{ color: "oklch(0.45 0.018 240)" }}>/ {total}</span>
        </span>
        <span className="mono-label" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.012 240)" }}>
        <div
          className="h-full rounded-full animate-progress"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function activityLabel(a: string) {
  const map: Record<string, string> = {
    registration: "Registration",
    goodies: "Goodies",
    lunch: "Lunch",
    snacks: "Snacks",
  };
  return map[a] ?? a;
}

function activityColor(a: string) {
  const map: Record<string, string> = {
    registration: "oklch(0.65 0.18 150)",
    goodies: "oklch(0.72 0.18 185)",
    lunch: "oklch(0.76 0.17 52)",
    snacks: "oklch(0.75 0.15 60)",
  };
  return map[a] ?? "oklch(0.55 0.018 240)";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivityIcon({ activity }: { activity: string }) {
  const icons: Record<string, React.ElementType> = {
    registration: UserCheck,
    goodies: Gift,
    lunch: Coffee,
    snacks: Cookie,
  };
  const Icon = icons[activity] ?? Activity;
  return <Icon className="w-3.5 h-3.5" />;
}

export default async function OperationsPage() {
  let data = {
    totalTeams: 0,
    totalMembers: 0,
    registered: 0,
    goodies: 0,
    lunch: 0,
    snacks: 0,
    recentLogs: [] as {
      id: string;
      performed_by_name: string;
      activity: string;
      timestamp: string;
      member_id: string;
    }[],
    pendingRegistrations: [] as { id: string; team_id: string; team_name: string }[],
  };

  try {
    data = await getOperationsData();
  } catch {
    // Empty if DB not connected
  }

  const overallPct =
    data.totalMembers > 0
      ? Math.round(
          ((data.registered + data.goodies + data.lunch + data.snacks) /
            (data.totalMembers * 4)) *
            100
        )
      : 0;

  const activityStats = [
    { label: "Registrations", value: data.registered, color: "oklch(0.65 0.18 150)", icon: UserCheck },
    { label: "Goodies", value: data.goodies, color: "oklch(0.72 0.18 185)", icon: Gift },
    { label: "Lunch", value: data.lunch, color: "oklch(0.76 0.17 52)", icon: Coffee },
    { label: "Snacks", value: data.snacks, color: "oklch(0.75 0.15 60)", icon: Cookie },
  ];

  return (
    <div className="max-w-4xl space-y-5 animate-fade-up">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label">Live Monitoring</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.65 0.18 150 / 0.1)",
                border: "1px solid oklch(0.65 0.18 150 / 0.25)",
              }}
            >
              <Activity className="w-4.5 h-4.5" style={{ color: "oklch(0.68 0.18 150)" }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.025em" }}
              >
                Operations{" "}
                <span className="vv-gradient-text">Status</span>
              </h1>
              <p className="text-sm" style={{ color: "oklch(0.50 0.018 240)" }}>
                Real-time event-day monitoring
              </p>
            </div>
          </div>

          {/* Overall progress */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded"
            style={{
              background: "oklch(0.12 0.012 240)",
              border: "1px solid oklch(0.20 0.012 240)",
            }}
          >
            <div>
              <p className="mono-label">Overall Completion</p>
              <p
                className="text-2xl font-bold leading-none mt-0.5"
                style={{ color: "oklch(0.82 0.17 52)", letterSpacing: "-0.03em" }}
              >
                {overallPct}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Aggregate stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Teams", value: data.totalTeams, icon: Users, color: "oklch(0.72 0.18 185)" },
          { label: "Participants", value: data.totalMembers, icon: CheckCircle2, color: "oklch(0.65 0.18 150)" },
          {
            label: "Pending Reg.",
            value: data.pendingRegistrations.length,
            icon: Clock,
            color: "oklch(0.76 0.17 52)",
          },
          {
            label: "Actions Logged",
            value: data.registered + data.goodies + data.lunch + data.snacks,
            icon: Activity,
            color: "oklch(0.62 0.18 185)",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="vv-card rounded p-3.5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="mono-label">{s.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <p
                className="text-2xl font-bold leading-none"
                style={{ color: "oklch(0.92 0.008 240)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Distribution progress ── */}
      <div
        className="rounded p-5"
        style={{
          background: "oklch(0.12 0.012 240)",
          border: "1px solid oklch(0.20 0.012 240)",
        }}
      >
        <p className="section-label mb-4">Distribution Progress</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {activityStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.75 0.01 240)" }}
                  >
                    {stat.label}
                  </span>
                </div>
                <ProgressBar value={stat.value} total={data.totalMembers} color={stat.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two-column bottom section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending registrations */}
        {data.pendingRegistrations.length > 0 && (
          <div
            className="rounded overflow-hidden"
            style={{
              background: "oklch(0.12 0.012 240)",
              border: "1px solid oklch(0.20 0.012 240)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: "oklch(0.76 0.17 52)" }} />
              <span className="section-label flex-1" style={{ gap: 0 }}>
                Pending Registrations
              </span>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.76 0.17 52 / 0.1)",
                  color: "oklch(0.82 0.17 52)",
                  border: "1px solid oklch(0.76 0.17 52 / 0.3)",
                }}
              >
                {data.pendingRegistrations.length}
              </span>
            </div>
            <div>
              {data.pendingRegistrations.slice(0, 8).map((team) => (
                <div key={team.id} className="data-row">
                  <span
                    className="text-sm flex-1"
                    style={{ color: "oklch(0.78 0.01 240)" }}
                  >
                    {team.team_name}
                  </span>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.76 0.17 52)" }}
                  >
                    {team.team_id}
                  </span>
                </div>
              ))}
              {data.pendingRegistrations.length > 8 && (
                <div
                  className="px-4 py-2.5 text-xs text-center"
                  style={{ color: "oklch(0.42 0.018 240)" }}
                >
                  +{data.pendingRegistrations.length - 8} more teams pending
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent audit log */}
        <div
          className="rounded overflow-hidden"
          style={{
            background: "oklch(0.12 0.012 240)",
            border: "1px solid oklch(0.20 0.012 240)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
          >
            <Activity className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.18 185)" }} />
            <span className="section-label flex-1" style={{ gap: 0 }}>
              Recent Activity Log
            </span>
            {data.recentLogs.length > 0 && (
              <div className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-soft-pulse"
                  style={{ background: "oklch(0.68 0.18 150)" }}
                />
                <span className="text-xs" style={{ color: "oklch(0.68 0.18 150)" }}>
                  Live
                </span>
              </div>
            )}
          </div>

          {data.recentLogs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: "oklch(0.42 0.018 240)" }}>
                No activity recorded yet.
              </p>
            </div>
          ) : (
            <div>
              {data.recentLogs.map((log) => {
                const color = activityColor(log.activity);
                return (
                  <div key={log.id} className="data-row gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color} / 0.1`, color }}
                    >
                      <ActivityIcon activity={log.activity} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: "oklch(0.72 0.01 240)" }}>
                        <span className="font-medium" style={{ color: "oklch(0.85 0.01 240)" }}>
                          {log.performed_by_name}
                        </span>
                        {" — "}
                        <span style={{ color }}>
                          {activityLabel(log.activity)}
                        </span>
                      </p>
                    </div>
                    <time
                      className="font-mono text-xs flex-shrink-0"
                      style={{ color: "oklch(0.40 0.018 240)" }}
                    >
                      {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
