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
  Radio,
  Filter,
  ShieldCheck,
  Search,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 15;

export const metadata = {
  title: "Operations Dispatch | ViceVerse Club Member Portal",
};

async function getOperationsData() {
  const supabase = await createClient();

  const [membersRes, teamsRes, logsRes] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, team_id, registration_status, goodies_status, lunch_status, snacks_status"),
    supabase
      .from("teams")
      .select("id, team_id, team_name")
      .eq("payment_status", "approved"),
    supabase
      .from("audit_logs")
      .select("id, performed_by_name, activity, timestamp, member_id")
      .order("timestamp", { ascending: false })
      .limit(15),
  ]);

  const members = membersRes.data;
  const teams = teamsRes.data;
  const recentLogs = logsRes.data;

  const totalMembers = members?.length ?? 0;
  const totalTeams = teams?.length ?? 0;

  const registered = members?.filter((m) => m.registration_status).length ?? 0;
  const goodies = members?.filter((m) => m.goodies_status).length ?? 0;
  const lunch = members?.filter((m) => m.lunch_status).length ?? 0;
  const snacks = members?.filter((m) => m.snacks_status).length ?? 0;

  return {
    totalTeams,
    totalMembers,
    registered,
    goodies,
    lunch,
    snacks,
    recentLogs: recentLogs ?? [],
    teams: teams ?? [],
    members: members ?? [],
  };
}

export default async function OperationsPage() {
  let data = {
    totalTeams: 0,
    totalMembers: 0,
    registered: 0,
    goodies: 0,
    lunch: 0,
    snacks: 0,
    recentLogs: [] as any[],
    teams: [] as any[],
    members: [] as any[],
  };

  try {
    data = await getOperationsData();
  } catch {
    // Database empty or demo environment
  }

  // Use actual data metrics
  const totalTeams = data.totalTeams;
  const totalMembers = data.totalMembers;
  const registered = data.registered;
  const goodies = data.goodies;
  const lunch = data.lunch;
  const snacks = data.snacks;
  const logsToDisplay = data.recentLogs;

  const cards = [
    {
      label: "REGISTRATION",
      count: registered,
      total: totalMembers,
      pct: Math.round((registered / totalMembers) * 100),
      color: "text-[#00F0FF]",
      border: "border-[#00F0FF]/30",
      bgBar: "from-[#00F0FF] to-[#00A3FF]",
      icon: UserCheck,
    },
    {
      label: "GOODIES DISTRIBUTION",
      count: goodies,
      total: totalMembers,
      pct: Math.round((goodies / totalMembers) * 100),
      color: "text-[#FF2A85]",
      border: "border-[#FF2A85]/30",
      bgBar: "from-[#FF2A85] to-[#FF0055]",
      icon: Gift,
    },
    {
      label: "LUNCH SERVICE",
      count: lunch,
      total: totalMembers,
      pct: Math.round((lunch / totalMembers) * 100),
      color: "text-[#FF8C00]",
      border: "border-[#FF8C00]/30",
      bgBar: "from-[#FF8C00] to-[#FF5E00]",
      icon: Coffee,
    },
    {
      label: "SNACKS SERVICE",
      count: snacks,
      total: totalMembers,
      pct: Math.round((snacks / totalMembers) * 100),
      color: "text-[#FFB800]",
      border: "border-[#FFB800]/30",
      bgBar: "from-[#FFB800] to-[#FF8C00]",
      icon: Cookie,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Operations Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-[#1E0D3D] via-[#14082B] to-[#0A0417] border border-[#FF2A85]/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-hud text-xs font-bold text-[#00F0FF] tracking-widest uppercase flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#FF2A85] animate-pulse" />
              LIVE TELEMETRY RADAR
            </span>
            <span className="text-[#6E5B8E]">&bull;</span>
            <span className="font-mono text-[0.6875rem] text-[#FFB800]">
              DISPATCH FREQUENCY 108.4 MHz
            </span>
          </div>
          <h1 className="font-gta text-3xl sm:text-4xl text-white tracking-wider uppercase">
            OPERATIONS <span className="vv-gradient-text">DISPATCH HUB</span>
          </h1>
          <p className="font-hud text-xs text-[#A192C2] tracking-wider uppercase">
            Bidappa &bull; Operations Dashboard &amp; Audit Log Telemetry Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-[#180C33] border border-[#00F0FF]/30 text-right">
            <p className="font-hud text-[0.65rem] text-[#A192C2] uppercase tracking-wider">
              TOTAL TEAMS MONITORED
            </p>
            <p className="font-mono text-xl font-bold text-white leading-none">
              {totalTeams} TEAMS
            </p>
          </div>
        </div>
      </div>

      {/* ── 4 Key Distribution Telemetry Counters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`vv-card p-5 border ${c.border} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-hud text-xs font-bold text-[#A192C2] tracking-wider uppercase">
                  {c.label}
                </span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>

              <div className="flex items-baseline justify-between font-hud">
                <span className="text-2xl font-bold text-white font-mono">
                  {c.count}{" "}
                  <span className="text-xs text-[#6E5B8E] font-sans">
                    / {c.total}
                  </span>
                </span>
                <span className={`text-sm font-bold ${c.color}`}>
                  {c.pct}%
                </span>
              </div>

              <div className="h-2 rounded-full overflow-hidden bg-[#1B0F33] p-0.5 border border-[#FF2A85]/20">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${c.bgBar} transition-all duration-500`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>

              <p className="font-hud text-[0.65rem] text-[#6E5B8E] uppercase tracking-wider text-right">
                PENDING: <strong className="text-white font-mono">{c.total - c.count}</strong>
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Two Columns: Pending Operations + Live Dispatch Audit Logs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Distribution Queue */}
        <div className="vv-card p-5 sm:p-6 border border-[#FF2A85]/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-gta text-xl text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF8C00]" />
              PENDING DISTRIBUTION QUEUE
            </h2>
            <span className="font-hud text-[0.6875rem] text-[#00F0FF] uppercase tracking-wider">
              PRIORITY QUEUE
            </span>
          </div>

          <p className="font-hud text-xs text-[#A192C2]">
            Teams with incomplete member distribution. Click any team ID to open dossier:
          </p>

          <div className="space-y-2">
          <div className="flex items-center justify-center p-4 border border-[#FF2A85]/20 rounded-lg">
            <span className="text-[#A192C2] text-xs font-hud">QUEUED TEAMS DISPLAY COMING SOON</span>
          </div>
          </div>
        </div>

        {/* Right: Live Audit Dispatch Log Stream */}
        <div className="vv-card p-5 sm:p-6 border border-[#00F0FF]/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-gta text-xl text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00F0FF]" />
              DISPATCH AUDIT LOG
            </h2>
            <div className="flex items-center gap-1.5 font-hud text-[0.6875rem] text-[#00FFA3]">
              <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-ping" />
              <span>LIVE TICKER</span>
            </div>
          </div>

          <p className="font-hud text-xs text-[#A192C2]">
            Audited records of all actions taken by authorized club members:
          </p>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {logsToDisplay.map((log: any, idx: number) => {
              const act = log.activity || "action";
              const officer = log.performed_by_name || "Club Member";
              const memberName = log.member_name || "Participant";
              const teamId = log.team_id || "IDN26-XXX";
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={log.id || idx}
                  className="p-3 rounded-lg bg-[#160B2E] border-l-2 border-l-[#00F0FF] border-y border-r border-[#FF2A85]/15 space-y-1 font-hud text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.65rem] text-[#00F0FF]">
                      {timeFormatted}
                    </span>
                    <span className="font-mono text-[0.65rem] text-[#FFB800] uppercase bg-[#FFB800]/10 px-1.5 py-0.5 rounded">
                      TEAM {teamId}
                    </span>
                  </div>

                  <p className="text-white text-xs leading-relaxed">
                    Officer <strong className="text-[#FF2A85]">{officer}</strong> marked{" "}
                    <strong className="text-[#00F0FF] uppercase">{act}</strong> for{" "}
                    <strong className="text-white">{memberName}</strong>.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
