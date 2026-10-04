"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Member, Team, ActivityType } from "@/types";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Gift,
  Coffee,
  Cookie,
  UserCheck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const activityConfig: Record<
  ActivityType,
  { label: string; icon: React.ElementType; color: string; field: keyof Member }
> = {
  registration: {
    label: "Registration",
    icon: UserCheck,
    color: "oklch(0.65 0.18 150)",
    field: "registration_status",
  },
  goodies: {
    label: "Goodies",
    icon: Gift,
    color: "oklch(0.72 0.18 185)",
    field: "goodies_status",
  },
  lunch: {
    label: "Lunch",
    icon: Coffee,
    color: "oklch(0.76 0.17 52)",
    field: "lunch_status",
  },
  snacks: {
    label: "Snacks",
    icon: Cookie,
    color: "oklch(0.75 0.15 60)",
    field: "snacks_status",
  },
};

interface ActionState {
  memberId: string;
  activity: ActivityType;
  loading: boolean;
  done: boolean;
  error: string | null;
}

export default function TeamPageContent() {
  const searchParams = useSearchParams();
  const qrToken = searchParams.get("qr");
  const teamIdParam = searchParams.get("id");

  const supabase = createClient();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTeam(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from("teams")
        .select(
          `*, members ( id, name, email, phone, role, registration_status, registration_by, registration_at, goodies_status, goodies_by, goodies_at, lunch_status, lunch_by, lunch_at, snacks_status, snacks_by, snacks_at )`
        );

      if (qrToken) {
        query = query.eq("qr_token", qrToken);
      } else if (teamIdParam) {
        query = query.eq("team_id", teamIdParam);
      } else {
        setError("No team identifier provided. Please scan a QR or enter a Team ID.");
        setLoading(false);
        return;
      }

      const { data, error: dbError } = await query.single();

      if (dbError || !data) {
        setError(
          qrToken
            ? "Invalid QR code. Team not found."
            : `Team ID "${teamIdParam}" not found. Please check and try again.`
        );
        setLoading(false);
        return;
      }

      if (data.payment_status !== "approved") {
        setError("This team's registration has not been approved yet.");
        setLoading(false);
        return;
      }

      setTeam(data as unknown as Team);
    } catch {
      setError("Failed to load team. Please try again.");
    }

    setLoading(false);
  }, [qrToken, teamIdParam, supabase]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  async function markActivity(member: Member, activity: ActivityType) {
    const key = `${member.id}-${activity}`;
    const field = activityConfig[activity].field;

    if (member[field]) {
      showToast(
        `${member.name} — ${activityConfig[activity].label} already completed.`,
        "error"
      );
      return;
    }

    setActionStates((prev) => ({
      ...prev,
      [key]: { memberId: member.id, activity, loading: true, done: false, error: null },
    }));

    try {
      const res = await fetch("/api/mark-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, activity, teamId: team!.id }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update");

      setTeam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.id === member.id
              ? {
                  ...m,
                  [`${activity}_status`]: true,
                  [`${activity}_by`]: result.performed_by,
                  [`${activity}_at`]: result.timestamp,
                }
              : m
          ),
        };
      });

      setActionStates((prev) => ({
        ...prev,
        [key]: { memberId: member.id, activity, loading: false, done: true, error: null },
      }));

      showToast(`${activityConfig[activity].label} marked for ${member.name}`, "success");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setActionStates((prev) => ({
        ...prev,
        [key]: { memberId: member.id, activity, loading: false, done: false, error: errMsg },
      }));
      showToast(`Failed: ${errMsg}`, "error");
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div
          className="w-12 h-12 rounded flex items-center justify-center"
          style={{
            background: "oklch(0.76 0.17 52 / 0.1)",
            border: "1px solid oklch(0.76 0.17 52 / 0.25)",
          }}
        >
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.82 0.17 52)" }} />
        </div>
        <p className="text-sm" style={{ color: "oklch(0.50 0.018 240)" }}>
          Loading team data…
        </p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div
          className="w-12 h-12 rounded flex items-center justify-center mx-auto mb-4"
          style={{
            background: "oklch(0.58 0.22 22 / 0.1)",
            border: "1px solid oklch(0.58 0.22 22 / 0.25)",
          }}
        >
          <AlertTriangle className="w-6 h-6" style={{ color: "oklch(0.68 0.22 22)" }} />
        </div>
        <h2 className="text-base font-semibold mb-1" style={{ color: "oklch(0.90 0.008 240)" }}>
          Team Not Found
        </h2>
        <p className="text-sm mb-5" style={{ color: "oklch(0.50 0.018 240)" }}>
          {error}
        </p>
        <a href="/dashboard/scan" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Scanner
        </a>
      </div>
    );
  }

  // ── Empty state ──
  if (!team) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="text-sm mb-4" style={{ color: "oklch(0.50 0.018 240)" }}>
          No team selected.
        </p>
        <a href="/dashboard/scan" className="btn-primary inline-flex">
          <ChevronRight className="w-4 h-4" />
          Scan Team QR
        </a>
      </div>
    );
  }

  const activities: ActivityType[] = ["registration", "goodies", "lunch", "snacks"];

  // Completion summary per activity
  const activityCompletion = activities.map((a) => ({
    activity: a,
    done: team.members.filter((m) => m[activityConfig[a].field]).length,
    total: team.members.length,
  }));

  return (
    <div className="max-w-3xl space-y-5 animate-fade-up">
      {/* ── Toast ── */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded text-sm font-medium shadow-2xl transition-all"
          style={{
            background: toast.type === "success"
              ? "oklch(0.14 0.012 240)"
              : "oklch(0.13 0.012 240)",
            border: toast.type === "success"
              ? "1px solid oklch(0.65 0.18 150 / 0.4)"
              : "1px solid oklch(0.58 0.22 22 / 0.4)",
            color: toast.type === "success"
              ? "oklch(0.72 0.18 150)"
              : "oklch(0.68 0.22 22)",
            borderLeft: toast.type === "success"
              ? "3px solid oklch(0.65 0.18 150)"
              : "3px solid oklch(0.58 0.22 22)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Team Info Card ── */}
      <div
        className="rounded overflow-hidden"
        style={{
          background: "oklch(0.12 0.012 240)",
          border: "1px solid oklch(0.20 0.012 240)",
          borderLeft: "3px solid oklch(0.76 0.17 52)",
        }}
      >
        <div className="px-5 py-4 flex items-start gap-4">
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: "oklch(0.76 0.17 52 / 0.1)",
              border: "1px solid oklch(0.76 0.17 52 / 0.25)",
            }}
          >
            <Users className="w-5 h-5" style={{ color: "oklch(0.82 0.17 52)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1
                className="text-lg font-bold leading-tight"
                style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.02em" }}
              >
                {team.team_name}
              </h1>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{
                  background: "oklch(0.155 0.012 240)",
                  color: "oklch(0.82 0.17 52)",
                  border: "1px solid oklch(0.76 0.17 52 / 0.3)",
                }}
              >
                {team.team_id}
              </span>
            </div>
            <p className="text-sm" style={{ color: "oklch(0.52 0.018 240)" }}>
              {team.domain} · {team.members.length} member{team.members.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
            style={{
              background: "oklch(0.65 0.18 150 / 0.08)",
              border: "1px solid oklch(0.65 0.18 150 / 0.25)",
              color: "oklch(0.70 0.18 150)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-soft-pulse"
              style={{ background: "oklch(0.68 0.18 150)" }}
            />
            Approved
          </div>
        </div>

        {/* Activity summary strip */}
        <div
          className="grid grid-cols-4 divide-x"
          style={{ borderTop: "1px solid oklch(0.185 0.012 240)" }}
        >
          {activityCompletion.map(({ activity, done, total }) => {
            const cfg = activityConfig[activity];
            const Icon = cfg.icon;
            const allDone = done === total && total > 0;
            return (
              <div
                key={activity}
                className="flex flex-col items-center py-3 gap-1"
                style={{ background: allDone ? `${cfg.color} / 0.04` : "transparent" }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: allDone ? cfg.color : "oklch(0.40 0.018 240)" }}
                />
                <span className="mono-label text-[0.6rem]">{cfg.label}</span>
                <span
                  className="text-xs font-bold leading-none"
                  style={{
                    color: allDone ? cfg.color : "oklch(0.70 0.01 240)",
                  }}
                >
                  {done}/{total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Members ── */}
      <div>
        <p className="section-label mb-3">
          <Users className="w-3.5 h-3.5" />
          Member Activity Tracking
        </p>

        <div className="space-y-3">
          {team.members.map((member, memberIdx) => (
            <div
              key={member.id}
              className="rounded overflow-hidden"
              style={{
                background: "oklch(0.12 0.012 240)",
                border: "1px solid oklch(0.20 0.012 240)",
              }}
            >
              {/* Member header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: "oklch(0.155 0.012 240)",
                    color: "oklch(0.76 0.17 52)",
                    border: "1px solid oklch(0.22 0.012 240)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  M{memberIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "oklch(0.90 0.008 240)" }}
                  >
                    {member.name}
                  </p>
                  <p className="text-xs leading-tight" style={{ color: "oklch(0.45 0.018 240)" }}>
                    {member.email}
                  </p>
                </div>
                {member.role === "leader" && (
                  <span
                    className="text-[0.6rem] font-mono font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: "oklch(0.76 0.17 52 / 0.1)",
                      color: "oklch(0.82 0.17 52)",
                      border: "1px solid oklch(0.76 0.17 52 / 0.3)",
                    }}
                  >
                    LEADER
                  </span>
                )}
              </div>

              {/* Activity grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: "oklch(0.185 0.012 240)" }}>
                {activities.map((activity) => {
                  const config = activityConfig[activity];
                  const Icon = config.icon;
                  const isCompleted = member[config.field] as boolean;
                  const key = `${member.id}-${activity}`;
                  const state = actionStates[key];
                  const isLoading = state?.loading;

                  return (
                    <div
                      key={activity}
                      className="p-3 space-y-2.5"
                      style={{
                        background: isCompleted
                          ? `${config.color} / 0.03`
                          : "oklch(0.115 0.012 240)",
                        borderColor: "oklch(0.185 0.012 240)",
                      }}
                    >
                      {/* Activity label */}
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: isCompleted ? config.color : "oklch(0.40 0.018 240)" }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: "oklch(0.58 0.018 240)" }}
                        >
                          {config.label}
                        </span>
                      </div>

                      {isCompleted ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <CheckCircle2
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={{ color: config.color }}
                            />
                            <span
                              className="text-xs font-medium"
                              style={{ color: config.color }}
                            >
                              Done
                            </span>
                          </div>
                          {member[`${activity}_at` as keyof Member] && (
                            <p
                              className="font-mono text-[0.65rem]"
                              style={{ color: "oklch(0.40 0.018 240)" }}
                            >
                              {new Date(
                                member[`${activity}_at` as keyof Member] as string
                              ).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          id={`mark-${activity}-${member.id}`}
                          onClick={() => markActivity(member, activity)}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.155 0.012 240)",
                            border: "1px solid oklch(0.22 0.012 240)",
                            color: "oklch(0.60 0.018 240)",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading) {
                              (e.currentTarget as HTMLButtonElement).style.background = `${config.color} / 0.08`;
                              (e.currentTarget as HTMLButtonElement).style.borderColor = `${config.color} / 0.3`;
                              (e.currentTarget as HTMLButtonElement).style.color = config.color;
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.155 0.012 240)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.22 0.012 240)";
                            (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.60 0.018 240)";
                          }}
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Mark Done
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Back link ── */}
      <div className="pt-1">
        <a
          href="/dashboard/scan"
          className="inline-flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "oklch(0.45 0.018 240)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Scan another team
        </a>
      </div>
    </div>
  );
}
