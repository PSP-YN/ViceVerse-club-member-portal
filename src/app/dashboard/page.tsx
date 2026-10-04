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
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Dashboard | ViceVerse Club Member Portal",
};

async function getStats() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("registration_status, goodies_status, lunch_status, snacks_status, team_id");

  const { data: teams } = await supabase
    .from("teams")
    .select("id")
    .eq("payment_status", "approved");

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, message, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const totalMembers = members?.length ?? 0;
  const totalTeams = teams?.length ?? 0;

  const registered = members?.filter((m) => m.registration_status).length ?? 0;
  const goodies = members?.filter((m) => m.goodies_status).length ?? 0;
  const lunch = members?.filter((m) => m.lunch_status).length ?? 0;
  const snacks = members?.filter((m) => m.snacks_status).length ?? 0;

  return { totalTeams, totalMembers, registered, goodies, lunch, snacks, announcements: announcements ?? [] };
}

function ProgressMini({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold" style={{ color: "oklch(0.92 0.008 240)", letterSpacing: "-0.02em" }}>
          {value}
          <span className="text-sm font-medium ml-1" style={{ color: "oklch(0.45 0.018 240)" }}>
            / {total}
          </span>
        </span>
        <span className="mono-label">{pct}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.012 240)" }}>
        <div
          className="h-full rounded-full animate-progress"
          style={{ width: `${pct}%`, background: color }}
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
    // Stats will be empty if database isn't connected
  }

  const operationStats = [
    {
      label: "Registrations",
      value: stats.registered,
      icon: CheckCircle2,
      color: "oklch(0.65 0.18 150)",
    },
    {
      label: "Goodies",
      value: stats.goodies,
      icon: Gift,
      color: "oklch(0.72 0.18 185)",
    },
    {
      label: "Lunch",
      value: stats.lunch,
      icon: Coffee,
      color: "oklch(0.76 0.17 52)",
    },
    {
      label: "Snacks",
      value: stats.snacks,
      icon: Cookie,
      color: "oklch(0.75 0.15 60)",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/scan",
      label: "Scan Team QR",
      description: "Use camera to scan a team's QR code",
      icon: QrCode,
      tag: "Primary",
    },
    {
      href: "/dashboard/team",
      label: "Enter Team ID",
      description: "Manually look up a team by their ID",
      icon: Users,
      tag: "Fallback",
    },
    {
      href: "/dashboard/announcements",
      label: "Announcements",
      description: "Read organizer communications",
      icon: Megaphone,
      tag: "Read-only",
    },
    {
      href: "/dashboard/operations",
      label: "Operations Status",
      description: "Monitor event-day progress in real time",
      icon: Activity,
      tag: "Live",
    },
  ];

  const overallPct =
    stats.totalMembers > 0
      ? Math.round(
          ((stats.registered + stats.goodies + stats.lunch + stats.snacks) /
            (stats.totalMembers * 4)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mono-label">Event Console</span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.025em" }}
          >
            Operations{" "}
            <span className="vv-gradient-text">Dashboard</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.50 0.018 240)" }}>
            ViceVerse Ideathon 2026 — event-day management
          </p>
        </div>

        {/* Overall progress chip */}
        {stats.totalMembers > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded"
            style={{
              background: "oklch(0.12 0.012 240)",
              border: "1px solid oklch(0.20 0.012 240)",
            }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.76 0.17 52)" }} />
            <div>
              <p className="mono-label">Overall Progress</p>
              <p
                className="text-lg font-bold leading-none"
                style={{ color: "oklch(0.82 0.17 52)" }}
              >
                {overallPct}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Announcements banner ── */}
      {stats.announcements.length > 0 && (
        <div
          className="rounded px-4 py-3"
          style={{
            background: "oklch(0.76 0.17 52 / 0.06)",
            border: "1px solid oklch(0.76 0.17 52 / 0.25)",
            borderLeft: "3px solid oklch(0.76 0.17 52)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-3.5 h-3.5" style={{ color: "oklch(0.82 0.17 52)" }} />
            <span className="mono-label" style={{ color: "oklch(0.76 0.17 52)" }}>
              Organizer Announcements
            </span>
          </div>
          <div className="space-y-1">
            {stats.announcements.map((ann) => (
              <div key={ann.id} className="flex items-start gap-2">
                <span className="text-xs mt-0.5" style={{ color: "oklch(0.76 0.17 52)" }}>·</span>
                <div>
                  <span className="text-sm font-medium" style={{ color: "oklch(0.88 0.01 240)" }}>
                    {ann.title}
                  </span>
                  {ann.message && (
                    <span className="text-xs ml-1.5" style={{ color: "oklch(0.52 0.018 240)" }}>
                      — {ann.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/announcements"
            className="inline-flex items-center gap-1 text-xs mt-2 transition-colors hover:underline"
            style={{ color: "oklch(0.76 0.17 52)" }}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Top stat row: Teams + Members ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Approved Teams",
            value: stats.totalTeams,
            icon: Users,
            mono: "Active",
            color: "oklch(0.72 0.18 185)",
          },
          {
            label: "Total Participants",
            value: stats.totalMembers,
            icon: CheckCircle2,
            mono: "Members",
            color: "oklch(0.65 0.18 150)",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="vv-card rounded p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="mono-label">{s.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <p
                className="text-3xl font-bold leading-none"
                style={{ color: "oklch(0.92 0.008 240)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.018 240)" }}>
                {s.mono}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Distribution progress ── */}
      <div>
        <p className="section-label mb-3">Distribution Progress</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {operationStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="vv-card rounded p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  <span className="mono-label">{stat.label}</span>
                </div>
                <ProgressMini
                  value={stat.value}
                  total={stats.totalMembers}
                  color={stat.color}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="section-label mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="
                  group flex items-center gap-4 px-4 py-3.5 rounded
                  transition-all duration-150
                  hover:border-[oklch(0.26_0.012_240)] hover:bg-[oklch(0.135_0.012_240)]
                "
                style={{
                  background: "oklch(0.12 0.012 240)",
                  border: "1px solid oklch(0.20 0.012 240)",
                }}
              >
                <div
                  className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: "oklch(0.155 0.012 240)",
                    border: "1px solid oklch(0.22 0.012 240)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "oklch(0.76 0.17 52)" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold leading-tight transition-colors"
                    style={{ color: "oklch(0.88 0.01 240)" }}
                  >
                    {action.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.018 240)" }}>
                    {action.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-[0.6rem] font-mono font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "oklch(0.155 0.012 240)",
                      color: "oklch(0.45 0.018 240)",
                      border: "1px solid oklch(0.22 0.012 240)",
                    }}
                  >
                    {action.tag}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "oklch(0.40 0.018 240)" }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
