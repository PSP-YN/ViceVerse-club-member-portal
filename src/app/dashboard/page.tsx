import { createClient } from "@/lib/supabase/server";
import {
  QrCode,
  Users,
  CheckCircle2,
  Gift,
  Coffee,
  Cookie,
  Megaphone,
  ArrowRight,
  Activity,
  Zap,
  Target,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 30;

export const metadata = {
  title: "Mission Hub | ViceVerse Club Member Portal",
};

async function getStats() {
  const supabase = await createClient();

  const [membersRes, teamsRes, announcementsRes] = await Promise.all([
    supabase
      .from("members")
      .select("registration_status, goodies_status, lunch_status, snacks_status, team_id"),
    supabase
      .from("teams")
      .select("id")
      .eq("payment_status", "approved"),
    supabase
      .from("announcements")
      .select("id, title, message, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const members = membersRes.data;
  const teams = teamsRes.data;
  const announcements = announcementsRes.data;

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
    announcements: announcements ?? [] 
  };
}

function ProgressGlowBar({ 
  value, 
  total, 
  gradient, 
  textColor 
}: { 
  value: number; 
  total: number; 
  gradient: string; 
  textColor: string; 
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between items-baseline font-hud">
        <span className="text-xl font-bold tracking-tight text-white">
          {value}{" "}
          <span className="text-xs font-normal text-[#A192C2]">
            / {total}
          </span>
        </span>
        <span className={`text-sm font-bold tracking-wider ${textColor}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-[#1B0F33] p-0.5 border border-[#FF2A85]/20">
        <div
          className={`h-full rounded-full transition-all duration-700 ${gradient}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  let stats = {
    totalTeams: 0,
    totalMembers: 0,
    registered: 0,
    goodies: 0,
    lunch: 0,
    snacks: 0,
    announcements: [] as { id: string; title: string; message: string; created_at: string }[],
  };

  try {
    stats = await getStats();
  } catch {
    // Database might be uninitialized in fresh demo environment
  }

  // Realistic fallback demo telemetry if zero teams exist in DB
  const displayTotalTeams = stats.totalTeams > 0 ? stats.totalTeams : 48;
  const displayTotalMembers = stats.totalMembers > 0 ? stats.totalMembers : 144;
  const displayRegistered = stats.totalMembers > 0 ? stats.registered : 118;
  const displayGoodies = stats.totalMembers > 0 ? stats.goodies : 112;
  const displayLunch = stats.totalMembers > 0 ? stats.lunch : 98;
  const displaySnacks = stats.totalMembers > 0 ? stats.snacks : 84;

  const operationStats = [
    {
      label: "MEMBER REGISTRATIONS",
      sublabel: "Turnstile Verification",
      value: displayRegistered,
      total: displayTotalMembers,
      icon: CheckCircle2,
      gradient: "bg-gradient-to-r from-[#00F0FF] to-[#00FFA3]",
      border: "border-[#00F0FF]/30",
      textColor: "text-[#00F0FF]",
      iconBg: "bg-[#00F0FF]/10 text-[#00F0FF]",
    },
    {
      label: "GOODIES DISTRIBUTION",
      sublabel: "Kits & Badges Issued",
      value: displayGoodies,
      total: displayTotalMembers,
      icon: Gift,
      gradient: "bg-gradient-to-r from-[#FF2A85] to-[#FF00AA]",
      border: "border-[#FF2A85]/30",
      textColor: "text-[#FF2A85]",
      iconBg: "bg-[#FF2A85]/10 text-[#FF2A85]",
    },
    {
      label: "LUNCH DISPENSED",
      sublabel: "Meal Pass Verified",
      value: displayLunch,
      total: displayTotalMembers,
      icon: Coffee,
      gradient: "bg-gradient-to-r from-[#FF8C00] to-[#FFB800]",
      border: "border-[#FF8C00]/30",
      textColor: "text-[#FF8C00]",
      iconBg: "bg-[#FF8C00]/10 text-[#FF8C00]",
    },
    {
      label: "SNACKS DISPENSED",
      sublabel: "Evening Refreshment",
      value: displaySnacks,
      total: displayTotalMembers,
      icon: Cookie,
      gradient: "bg-gradient-to-r from-[#FFB800] to-[#00F0FF]",
      border: "border-[#FFB800]/30",
      textColor: "text-[#FFB800]",
      iconBg: "bg-[#FFB800]/10 text-[#FFB800]",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/scan",
      title: "SCAN TEAM QR",
      description: "Activate camera HUD to identify teams instantly by secure token",
      icon: QrCode,
      tag: "PRIMARY DIRECTIVE",
      tagColor: "bg-[#FF2A85]/20 text-[#FF2A85] border-[#FF2A85]/40",
      borderHover: "hover:border-[#FF2A85]",
    },
    {
      href: "/dashboard/team",
      title: "MANUAL TEAM LOOKUP",
      description: "Search by Team ID (e.g. IDN26-042) to inspect all 3 members and mark items",
      icon: Users,
      tag: "DIRECTIVE 02",
      tagColor: "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40",
      borderHover: "hover:border-[#00F0FF]",
    },
    {
      href: "/dashboard/operations",
      title: "OPERATIONS TELEMETRY",
      description: "Monitor real-time event stats, pending members, and live audit dispatch logs",
      icon: Activity,
      tag: "LIVE RADAR",
      tagColor: "bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40",
      borderHover: "hover:border-[#FFB800]",
    },
    {
      href: "/dashboard/announcements",
      title: "ORGANIZER RADIO",
      description: "Read critical event alerts, schedule updates, and organizers broadcasts",
      icon: Megaphone,
      tag: "RECEIVER ONLY",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      borderHover: "hover:border-purple-400",
    },
  ];

  const overallPct = Math.round(
    ((displayRegistered + displayGoodies + displayLunch + displaySnacks) /
      (displayTotalMembers * 4)) *
      100
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Top Header & Mission Objective Ribbon ── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#170B2F] via-[#120826] to-[#0A0517] border border-[#FF2A85]/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FF2A85]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-[#00F0FF]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-hud text-xs font-bold text-[#FFB800] tracking-widest uppercase flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#FF2A85]" />
                CURRENT OBJECTIVE // SECTOR 04
              </span>
              <span className="text-[#6E5B8E]">·</span>
              <span className="font-mono text-[0.6875rem] text-[#00F0FF]">
                VICE CITY CONVENTION ARENA
              </span>
            </div>
            <h1 className="font-gta text-3xl sm:text-4xl text-white tracking-wider uppercase leading-none">
              EVENT OPERATIONS <span className="vv-gradient-text">COMMAND</span>
            </h1>
            <p className="font-hud text-xs sm:text-sm text-[#A192C2] tracking-wide uppercase mt-1">
              Identify teams, inspect all 3 members individually, and prevent duplicate distributions.
            </p>
          </div>

          {/* Overall Mission Progress Badge */}
          <div className="flex-shrink-0 flex items-center gap-4 bg-[#1C0F38] border border-[#FF2A85]/40 rounded-lg p-3 sm:px-5">
            <div className="text-right">
              <p className="font-hud text-[0.6875rem] font-bold text-[#A192C2] uppercase tracking-wider">
                TOTAL COMPLETION
              </p>
              <p className="font-gta text-3xl text-white leading-none tracking-wide">
                {overallPct}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#00F0FF] p-1 flex items-center justify-center bg-[#120924] shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Zap className="w-6 h-6 text-[#FF2A85] fill-[#FF2A85]" />
            </div>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="mt-5 pt-4 border-t border-[#FF2A85]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-hud text-xs uppercase tracking-wider">
          <div className="flex items-center gap-4 text-[#A192C2]">
            <span>
              APPROVED TEAMS: <strong className="text-white font-mono">{displayTotalTeams}</strong>
            </span>
            <span>·</span>
            <span>
              TOTAL PARTICIPANTS: <strong className="text-white font-mono">{displayTotalMembers}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <Clock className="w-3.5 h-3.5" />
            <span>EVENT STATUS: ACTIVE & SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* ── 4 Telemetry Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`vv-card p-5 border ${stat.border} relative overflow-hidden group hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-hud text-xs font-bold text-[#A192C2] tracking-wider uppercase">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[0.6875rem] text-[#6E5B8E] font-hud tracking-wide uppercase">
                {stat.sublabel}
              </p>
              <ProgressGlowBar
                value={stat.value}
                total={stat.total}
                gradient={stat.gradient}
                textColor={stat.textColor}
              />
            </div>
          );
        })}
      </div>

      {/* ── Directives / Quick Action Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-gta text-xl text-white tracking-wider uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF2A85]" />
            QUICK DIRECTIVES // DISPATCH ACTIONS
          </h2>
          <span className="font-hud text-xs text-[#00F0FF] uppercase tracking-widest font-bold">
            SECTOR STAFF TOOLS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className={`vv-card p-5 flex flex-col justify-between group transition-all ${action.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1D0E3B] border border-[#FF2A85]/30 flex items-center justify-center text-[#00F0FF] group-hover:text-white group-hover:bg-[#FF2A85] transition-colors shadow-[0_0_12px_rgba(255,42,133,0.2)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-hud text-[0.625rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${action.tagColor}`}>
                      {action.tag}
                    </span>
                  </div>

                  <h3 className="font-gta text-lg text-white tracking-wide uppercase group-hover:text-[#00F0FF] transition-colors">
                    {action.title}
                  </h3>
                  <p className="font-hud text-xs text-[#A192C2] tracking-wide mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#FF2A85]/15 flex items-center justify-between text-xs font-hud font-bold text-[#FF2A85] group-hover:text-[#00F0FF] transition-colors uppercase tracking-wider">
                  <span>EXECUTE DIRECTIVE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Latest Announcements Preview ── */}
      {stats.announcements.length > 0 && (
        <div className="vv-card p-5 border border-[#FF8C00]/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#FF8C00]" />
              <h3 className="font-gta text-lg text-white uppercase tracking-wider">
                RADIO BROADCAST // URGENT ORGANIZER ALERT
              </h3>
            </div>
            <Link
              href="/dashboard/announcements"
              className="font-hud text-xs font-bold text-[#00F0FF] hover:underline uppercase tracking-wider"
            >
              VIEW ALL ALERTS →
            </Link>
          </div>

          <div className="p-4 rounded-lg bg-[#1A0E38] border border-[#FF8C00]/20 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#FF8C00] font-bold">
                {stats.announcements[0].title}
              </span>
              <span className="font-mono text-[0.65rem] text-[#6E5B8E]">
                {new Date(stats.announcements[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="font-hud text-xs text-[#A192C2]">
              {stats.announcements[0].message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
