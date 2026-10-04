"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Member, Team, ActivityType } from "@/types";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Gift,
  Coffee,
  Cookie,
  UserCheck,
  ChevronRight,
} from "lucide-react";

const activityConfig: Record<
  ActivityType,
  { label: string; icon: React.ElementType; color: string; field: keyof Member }
> = {
  registration: {
    label: "Registration",
    icon: UserCheck,
    color: "text-blue-400",
    field: "registration_status",
  },
  goodies: {
    label: "Goodies",
    icon: Gift,
    color: "text-purple-400",
    field: "goodies_status",
  },
  lunch: {
    label: "Lunch",
    icon: Coffee,
    color: "text-orange-400",
    field: "lunch_status",
  },
  snacks: {
    label: "Snacks",
    icon: Cookie,
    color: "text-yellow-400",
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

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function markActivity(member: Member, activity: ActivityType) {
    const key = `${member.id}-${activity}`;
    const field = activityConfig[activity].field;

    if (member[field]) {
      showToast(
        `${member.name} already has ${activityConfig[activity].label} marked as completed.`,
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
        body: JSON.stringify({
          memberId: member.id,
          activity,
          teamId: team!.id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update");
      }

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

      showToast(`✅ ${activityConfig[activity].label} marked for ${member.name}`, "success");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setActionStates((prev) => ({
        ...prev,
        [key]: { memberId: member.id, activity, loading: false, done: false, error: errMsg },
      }));
      showToast(`Failed: ${errMsg}`, "error");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 rounded-2xl vv-gradient flex items-center justify-center animate-pulse">
          <Users className="w-8 h-8 text-white" />
        </div>
        <p className="text-muted-foreground text-sm">Loading team data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Team Not Found</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <a
          href="/dashboard/scan"
          className="inline-block mt-2 px-6 py-2.5 rounded-xl vv-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </a>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-md mx-auto mt-12 glass-card rounded-2xl p-8 text-center space-y-4">
        <p className="text-muted-foreground">No team selected.</p>
        <a
          href="/dashboard/scan"
          className="inline-block px-6 py-2.5 rounded-xl vv-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Scan Team QR
        </a>
      </div>
    );
  }

  const activities: ActivityType[] = ["registration", "goodies", "lunch", "snacks"];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-900 border border-green-700 text-green-300"
              : "bg-red-900 border border-red-700 text-red-300"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Team Info Card */}
      <div className="glass-card rounded-2xl p-6 glow-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl vv-gradient flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{team.team_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                {team.team_id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{team.domain}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-950 border border-green-800 text-green-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Approved
          </div>
        </div>
      </div>

      {/* Members & Activity Tracking */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Member-wise Activity Tracking
        </h2>

        <div className="space-y-4">
          {team.members.map((member, memberIdx) => (
            <div
              key={member.id}
              className="glass-card rounded-2xl border border-border overflow-hidden"
            >
              {/* Member header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/30">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold text-primary">
                  M{memberIdx + 1}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                {member.role === "leader" && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    Team Leader
                  </span>
                )}
              </div>

              {/* Activity grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
                {activities.map((activity) => {
                  const config = activityConfig[activity];
                  const Icon = config.icon;
                  const isCompleted = member[config.field] as boolean;
                  const key = `${member.id}-${activity}`;
                  const state = actionStates[key];
                  const isLoading = state?.loading;

                  return (
                    <div key={activity} className="bg-card p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {config.label}
                        </span>
                      </div>

                      {isCompleted ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">
                              Completed
                            </span>
                          </div>
                          {member[`${activity}_at` as keyof Member] && (
                            <p className="text-xs text-muted-foreground font-mono">
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
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-primary/20 hover:text-primary border border-border hover:border-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Mark Done
                              <ChevronRight className="w-3 h-3" />
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

      {/* Summary strip */}
      <div className="glass-card rounded-2xl p-4 grid grid-cols-4 gap-4">
        {activities.map((activity) => {
          const config = activityConfig[activity];
          const Icon = config.icon;
          const completed = team.members.filter(
            (m) => m[config.field]
          ).length;
          const total = team.members.length;
          const allDone = completed === total;
          return (
            <div key={activity} className="text-center space-y-1">
              <Icon className={`w-5 h-5 mx-auto ${config.color}`} />
              <p className="text-xs text-muted-foreground">{config.label}</p>
              <p
                className={`text-sm font-bold ${
                  allDone ? "text-green-400" : "text-foreground"
                }`}
              >
                {completed}/{total}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
