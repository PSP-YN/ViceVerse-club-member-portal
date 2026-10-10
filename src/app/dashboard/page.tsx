import { createClient } from "@/lib/supabase/server";
import { getApprovedTeams } from "@/lib/operations/data";
import { buildSummary } from "@/lib/operations/summary";
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
} from "lucide-react";
import Link from "next/link";

export const revalidate = 30;

export const metadata = {
  title: "Dashboard | ViceVerse Club Member Portal",
};

async function getStats() {
  const supabase = await createClient();

  // Member figures come from approved teams only (same helper as the
  // Operations page), so members of unapproved teams can't inflate totals.
  const teams = await getApprovedTeams(supabase);
  const summary = buildSummary(teams, [], new Date());

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, message, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const totalMembers = summary.totalMembers;
  const totalTeams = teams.length;

  const registered = summary.activities.registration.completed;
  const goodies = summary.activities.goodies.completed;
  const lunch = summary.activities.lunch.completed;
  const snacks = summary.activities.snacks.completed;

  return {
    totalTeams,
    totalMembers,
    registered,
    goodies,
    lunch,
    snacks,
    announcements: announcements ?? [],
  };
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
    // Stats will be empty if database isn't connected
  }

  const statCards = [
    {
      label: "Teams Registered",
      value: stats.totalTeams,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-950/40",
      border: "border-blue-800/40",
    },
    {
      label: "Registrations",
      value: `${stats.registered}/${stats.totalMembers}`,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-950/40",
      border: "border-green-800/40",
    },
    {
      label: "Goodies Distributed",
      value: `${stats.goodies}/${stats.totalMembers}`,
      icon: Gift,
      color: "text-purple-400",
      bg: "bg-purple-950/40",
      border: "border-purple-800/40",
    },
    {
      label: "Lunch Distributed",
      value: `${stats.lunch}/${stats.totalMembers}`,
      icon: Coffee,
      color: "text-orange-400",
      bg: "bg-orange-950/40",
      border: "border-orange-800/40",
    },
    {
      label: "Snacks Distributed",
      value: `${stats.snacks}/${stats.totalMembers}`,
      icon: Cookie,
      color: "text-yellow-400",
      bg: "bg-yellow-950/40",
      border: "border-yellow-800/40",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/scan",
      label: "Scan Team QR",
      description: "Scan a team's QR code to start operations",
      icon: QrCode,
      color: "from-blue-600 to-violet-600",
    },
    {
      href: "/dashboard/team",
      label: "Enter Team ID",
      description: "Manually look up a team by their Team ID",
      icon: Users,
      color: "from-violet-600 to-pink-600",
    },
    {
      href: "/dashboard/announcements",
      label: "View Announcements",
      description: "Read organizer announcements and alerts",
      icon: Megaphone,
      color: "from-pink-600 to-orange-600",
    },
    {
      href: "/dashboard/operations",
      label: "Operations Status",
      description: "Monitor event-day activity and progress",
      icon: Activity,
      color: "from-green-600 to-teal-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Club Member{" "}
          <span className="vv-gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage event-day operations for ViceVerse Ideathon
        </p>
      </div>

      {/* Announcements Banner */}
      {stats.announcements.length > 0 && (
        <div className="rounded-2xl border border-yellow-800/40 bg-yellow-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
            <Megaphone className="w-4 h-4" />
            Latest Announcements
          </div>
          {stats.announcements.map((ann) => (
            <div key={ann.id} className="pl-6">
              <p className="text-sm font-medium text-foreground">{ann.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ann.message}
              </p>
            </div>
          ))}
          <Link
            href="/dashboard/announcements"
            className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 pl-6 pt-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Event Operations Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`glass-card rounded-2xl p-4 border ${stat.border} ${stat.bg} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg bg-black/20`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="glass-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:glow-border transition-all group flex items-start gap-4"
              >
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
