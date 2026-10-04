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
    .select(
      "id, name, team_id, registration_status, goodies_status, lunch_status, snacks_status"
    );

  const { data: teams } = await supabase
    .from("teams")
    .select("id, team_id, team_name")
    .eq("payment_status", "approved");

  const { data: recentLogs } = await supabase
    .from("audit_logs")
    .select("id, performed_by_name, activity, timestamp, member_id")
    .order("timestamp", { ascending: false })
    .limit(10);

  const totalMembers = members?.length ?? 0;
  const totalTeams = teams?.length ?? 0;

  const registered = members?.filter((m) => m.registration_status).length ?? 0;
  const goodies = members?.filter((m) => m.goodies_status).length ?? 0;
  const lunch = members?.filter((m) => m.lunch_status).length ?? 0;
  const snacks = members?.filter((m) => m.snacks_status).length ?? 0;

  // Pending teams (have at least one member with pending registration)
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

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {value}/{total}
        </span>
        <span className="font-medium text-foreground">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full vv-gradient transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
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

  const activityStats = [
    {
      label: "Registrations",
      value: data.registered,
      icon: UserCheck,
      color: "text-blue-400",
      borderColor: "border-blue-800/30",
    },
    {
      label: "Goodies",
      value: data.goodies,
      icon: Gift,
      color: "text-purple-400",
      borderColor: "border-purple-800/30",
    },
    {
      label: "Lunch",
      value: data.lunch,
      icon: Coffee,
      color: "text-orange-400",
      borderColor: "border-orange-800/30",
    },
    {
      label: "Snacks",
      value: data.snacks,
      icon: Cookie,
      color: "text-yellow-400",
      borderColor: "border-yellow-800/30",
    },
  ];

  function activityLabel(a: string) {
    const map: Record<string, string> = {
      registration: "Registration",
      goodies: "Goodies",
      lunch: "Lunch",
      snacks: "Snacks",
    };
    return map[a] ?? a;
  }

  function activityIcon(a: string) {
    const map: Record<string, React.ElementType> = {
      registration: UserCheck,
      goodies: Gift,
      lunch: Coffee,
      snacks: Cookie,
    };
    return map[a] ?? Activity;
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl vv-gradient flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Operations <span className="vv-gradient-text">Status</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Live event-day monitoring dashboard
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-blue-800/30 bg-blue-950/10">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Teams
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.totalTeams}</p>
          <p className="text-xs text-muted-foreground mt-1">Approved &amp; active</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-green-800/30 bg-green-950/10">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Members
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.totalMembers}</p>
          <p className="text-xs text-muted-foreground mt-1">Total participants</p>
        </div>
      </div>

      {/* Activity progress */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Distribution Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {activityStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`space-y-3 p-4 rounded-xl border ${stat.borderColor} bg-black/20`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm font-medium text-foreground">
                    {stat.label}
                  </span>
                </div>
                <ProgressBar value={stat.value} total={data.totalMembers} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending registrations */}
      {data.pendingRegistrations.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            Pending Registrations ({data.pendingRegistrations.length} teams)
          </h2>
          <div className="space-y-2">
            {data.pendingRegistrations.slice(0, 10).map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 text-sm"
              >
                <span className="text-foreground">{team.team_name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {team.team_id}
                </span>
              </div>
            ))}
            {data.pendingRegistrations.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{data.pendingRegistrations.length - 10} more teams pending
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Audit Log */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Activity Log
        </h2>
        {data.recentLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No activity recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentLogs.map((log) => {
              const Icon = activityIcon(log.activity);
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{log.performed_by_name}</span>
                      {" marked "}
                      <span className="text-primary font-medium">
                        {activityLabel(log.activity)}
                      </span>
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground font-mono flex-shrink-0">
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
  );
}
