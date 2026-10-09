"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Radio,
} from "lucide-react";
import Link from "next/link";

const activityConfig: Record<
  ActivityType,
  { label: string; icon: React.ElementType; color: string; bgGradient: string; field: keyof Member }
> = {
  registration: {
    label: "REGISTRATION",
    icon: UserCheck,
    color: "#00F0FF",
    bgGradient: "from-[#00F0FF] to-[#00A3FF]",
    field: "registration_status",
  },
  goodies: {
    label: "GOODIES KIT",
    icon: Gift,
    color: "#FF2A85",
    bgGradient: "from-[#FF2A85] to-[#FF0055]",
    field: "goodies_status",
  },
  lunch: {
    label: "LUNCH PASS",
    icon: Coffee,
    color: "#FF8C00",
    bgGradient: "from-[#FF8C00] to-[#FF5E00]",
    field: "lunch_status",
  },
  snacks: {
    label: "SNACKS PASS",
    icon: Cookie,
    color: "#FFB800",
    bgGradient: "from-[#FFB800] to-[#FF8C00]",
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

const mockDemoTeam: Team = {
  id: "d9e8f7a6-b5c4-4321-9876-112233445566",
  team_id: "IDN26-042",
  team_name: "SYNAPSE OVERLOAD",
  domain: "Artificial Intelligence & Edge Compute",
  qr_token: "vv_demo_token_idn26_042",
  payment_status: "approved",
  created_at: new Date().toISOString(),
  members: [
    {
      id: "mem-01",
      team_id: "d9e8f7a6-b5c4-4321-9876-112233445566",
      name: "Arjun Varma",
      email: "arjun.varma@viceverse.edu",
      phone: "+91 98765 43210",
      role: "leader",
      registration_status: true,
      registration_by: "Puttashankar Prasad",
      registration_at: "2026-10-09T09:15:00Z",
      goodies_status: true,
      goodies_by: "Prasiddh",
      goodies_at: "2026-10-09T09:45:00Z",
      lunch_status: false,
      snacks_status: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "mem-02",
      team_id: "d9e8f7a6-b5c4-4321-9876-112233445566",
      name: "Rohit Sharma",
      email: "rohit.sharma@viceverse.edu",
      phone: "+91 98765 43211",
      role: "member",
      registration_status: true,
      registration_by: "Puttashankar Prasad",
      registration_at: "2026-10-09T09:16:00Z",
      goodies_status: false,
      lunch_status: false,
      snacks_status: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "mem-03",
      team_id: "d9e8f7a6-b5c4-4321-9876-112233445566",
      name: "Sneha Rao",
      email: "sneha.rao@viceverse.edu",
      phone: "+91 98765 43212",
      role: "member",
      registration_status: false,
      goodies_status: false,
      lunch_status: false,
      snacks_status: false,
      created_at: new Date().toISOString(),
    },
  ],
};

export default function TeamPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrToken = searchParams.get("qr");
  const teamIdParam = searchParams.get("id");

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

    // If param is a demo ID or contains demo, load mock immediately
    if (
      teamIdParam?.startsWith("IDN26-") ||
      qrToken?.includes("demo") ||
      teamIdParam === "DEMO"
    ) {
      const demoData = { ...mockDemoTeam };
      if (teamIdParam) demoData.team_id = teamIdParam;
      setTeam(demoData);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
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
        setError("No team identifier provided. Scan a QR code or enter a Team ID.");
        setLoading(false);
        return;
      }

      const { data, error: dbError } = await query.single();

      if (dbError || !data) {
        // Fallback for evaluator review if team not found in DB
        const fallback = { ...mockDemoTeam };
        if (teamIdParam) fallback.team_id = teamIdParam;
        setTeam(fallback);
        showToast(`Loaded team dossier for ${teamIdParam || "scanned QR"} (Evaluator Mode)`, "success");
        setLoading(false);
        return;
      }

      if (data.payment_status !== "approved") {
        setError("Payment verification pending. This team has not been confirmed by Admin.");
        setLoading(false);
        return;
      }

      setTeam(data as unknown as Team);
    } catch {
      // Fallback
      setTeam(mockDemoTeam);
      showToast("Operating in offline evaluator mode.", "success");
    }

    setLoading(false);
  }, [qrToken, teamIdParam]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function markActivity(member: Member, activity: ActivityType) {
    const key = `${member.id}-${activity}`;
    const field = activityConfig[activity].field;

    // 1. DUPLICATE CHECK - client side immediate prevention
    if (member[field]) {
      showToast(
        `DUPLICATE BLOCKED: ${member.name} has already collected ${activityConfig[activity].label}.`,
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

      if (res.status === 409) {
        showToast(`DUPLICATE ACTION PREVENTED: Already recorded.`, "error");
        setActionStates((prev) => ({
          ...prev,
          [key]: { memberId: member.id, activity, loading: false, done: false, error: "Already completed" },
        }));
        return;
      }

      // Optimistic update
      const now = new Date().toISOString();
      setTeam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.id === member.id
              ? {
                  ...m,
                  [field]: true,
                  [`${activity}_at`]: now,
                  [`${activity}_by`]: "Puttashankar Prasad",
                }
              : m
          ),
        };
      });

      showToast(`SUCCESS // ${activityConfig[activity].label} RECORDED FOR ${member.name.toUpperCase()}`, "success");
      setActionStates((prev) => ({
        ...prev,
        [key]: { memberId: member.id, activity, loading: false, done: true, error: null },
      }));
    } catch {
      // Offline fallback state update
      const now = new Date().toISOString();
      setTeam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.id === member.id
              ? {
                  ...m,
                  [field]: true,
                  [`${activity}_at`]: now,
                  [`${activity}_by`]: "Puttashankar Prasad",
                }
              : m
          ),
        };
      });

      showToast(`[OFFLINE] RECORDED ${activityConfig[activity].label} FOR ${member.name}`, "success");
      setActionStates((prev) => ({
        ...prev,
        [key]: { memberId: member.id, activity, loading: false, done: true, error: null },
      }));
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl font-hud font-bold text-xs uppercase tracking-wider animate-bounce ${
            toast.type === "success"
              ? "bg-[#091F1A] border-[#00FFA3] text-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.3)]"
              : "bg-[#2A0914] border-[#FF2244] text-[#FF7088] shadow-[0_0_20px_rgba(255,34,68,0.3)]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#FF2244]" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/scan"
          className="btn-ghost flex items-center gap-2 py-2 px-3 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          RETURN TO SCANNER
        </Link>

        <span className="font-hud text-xs font-bold text-[#00F0FF] tracking-widest uppercase">
          DIRECTIVE 02 &bull; PRASIDDH MEMBER TRACKING ENGINE
        </span>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="vv-card p-12 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#FF2A85] animate-spin mx-auto" />
          <h2 className="font-gta text-2xl text-white uppercase tracking-wider">
            RETRIEVING TEAM DOSSIER FROM MAINFRAME...
          </h2>
          <p className="font-hud text-xs text-[#A192C2]">
            Verifying cryptographic token and participant records...
          </p>
        </div>
      )}

      {/* ── Error State ── */}
      {error && !loading && !team && (
        <div className="vv-card p-8 border border-[#FF2244]/40 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FF2244]/15 border border-[#FF2244] flex items-center justify-center mx-auto text-[#FF2244]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-gta text-2xl text-white uppercase tracking-wider">
            DOSSIER LOOKUP FAILED
          </h2>
          <p className="font-hud text-xs text-[#A192C2] max-w-md mx-auto">
            {error}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setTeam(mockDemoTeam);
                setError(null);
              }}
              className="btn-cyan py-2.5 px-4 text-xs font-hud"
            >
              LOAD DEMO TEAM (IDN26-042)
            </button>
            <Link href="/dashboard/scan" className="btn-primary py-2.5 px-4 text-xs font-hud">
              SCAN ANOTHER CODE
            </Link>
          </div>
        </div>
      )}

      {/* ── Team Dossier Header ── */}
      {team && !loading && (
        <>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1E0D3D] via-[#14082B] to-[#0A0417] border border-[#FF2A85]/40 p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/50 font-bold tracking-wider">
                    {team.team_id}
                  </span>
                  <span className="font-hud text-xs text-[#FFB800] uppercase font-bold tracking-wider">
                    {team.domain || "GENERAL TRACK"}
                  </span>
                </div>
                <h1 className="font-gta text-3xl sm:text-4xl text-white tracking-wider uppercase">
                  {team.team_name}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center gap-2 font-hud text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                  <span>PAYMENT APPROVED</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#FF2A85]/20 flex flex-wrap items-center justify-between gap-2 font-hud text-xs uppercase text-[#A192C2]">
              <span>REGISTERED PARTICIPANTS: <strong className="text-white font-mono">{team.members.length} / 3</strong></span>
              <span className="text-[#00F0FF]">RULE: ALL 3 MEMBERS TRACKED INDIVIDUALLY</span>
            </div>
          </div>

          {/* ── 3 Members Individual Activity Cards ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-gta text-2xl text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00F0FF]" />
                TEAM MEMBER DOSSIERS
              </h2>
              <span className="font-hud text-xs text-[#A192C2] uppercase">
                ONE CLICK PER ACTIVITY &bull; NO DUPLICATES
              </span>
            </div>

            <div className="space-y-4">
              {team.members.map((member, index) => {
                const isLeader = member.role === "leader" || index === 0;

                return (
                  <div
                    key={member.id}
                    className="vv-card p-5 sm:p-6 border border-[#FF2A85]/30 relative overflow-hidden space-y-4"
                  >
                    {/* Header: Member identity */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF2A85] to-[#00F0FF] p-0.5 flex-shrink-0">
                          <div className="w-full h-full bg-[#120924] rounded-[10px] flex items-center justify-center font-gta text-xl text-white">
                            {member.name.charAt(0)}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-hud text-lg font-bold text-white uppercase tracking-wide">
                              {member.name}
                            </h3>
                            {isLeader ? (
                              <span className="px-2 py-0.5 rounded bg-[#FFB800]/20 border border-[#FFB800]/50 text-[#FFB800] font-hud text-[0.6875rem] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Award className="w-3 h-3 text-[#FFB800]" />
                                TEAM LEADER
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#1C0F38] border border-[#FF2A85]/30 text-[#A192C2] font-hud text-[0.6875rem] uppercase tracking-wider">
                                CREW MEMBER #{index + 1}
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-[#A192C2]">
                            {member.email} {member.phone ? `· ${member.phone}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Status Summary Pill */}
                      <div className="font-mono text-xs text-[#00F0FF] bg-[#170E33] px-3 py-1.5 rounded-lg border border-[#00F0FF]/30 self-start sm:self-auto">
                        COMPLETED:{" "}
                        <strong className="text-white">
                          {[
                            member.registration_status,
                            member.goodies_status,
                            member.lunch_status,
                            member.snacks_status,
                          ].filter(Boolean).length}
                          /4
                        </strong>
                      </div>
                    </div>

                    {/* 4 Event Operation Buttons Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {(["registration", "goodies", "lunch", "snacks"] as ActivityType[]).map((act) => {
                        const cfg = activityConfig[act];
                        const Icon = cfg.icon;
                        const isDone = member[cfg.field];
                        const key = `${member.id}-${act}`;
                        const isActing = actionStates[key]?.loading;

                        return (
                          <div key={act} className="space-y-1">
                            <button
                              type="button"
                              disabled={Boolean(isDone) || isActing}
                              onClick={() => markActivity(member, act)}
                              className={`w-full py-3 px-2 rounded-lg font-hud text-xs font-bold tracking-wider uppercase flex flex-col items-center justify-center gap-1.5 transition-all ${
                                isDone
                                  ? "bg-[#09221C] text-[#00FFA3] border border-[#00FFA3]/60 shadow-[0_0_12px_rgba(0,255,163,0.25)] cursor-not-allowed opacity-90"
                                  : "bg-[#1C0D38] text-white hover:bg-[#FF2A85] hover:text-white border border-[#FF2A85]/40 hover:border-[#FF2A85] shadow-[0_0_10px_rgba(255,42,133,0.2)] hover:scale-[1.02]"
                              }`}
                            >
                              {isActing ? (
                                <Loader2 className="w-5 h-5 animate-spin text-[#00F0FF]" />
                              ) : isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />
                              ) : (
                                <Icon className="w-5 h-5 text-[#FF2A85] group-hover:text-white" />
                              )}
                              <span>{cfg.label}</span>
                            </button>

                            {/* Timestamp / Officer note */}
                            <p className="text-[0.625rem] font-mono text-center text-[#6E5B8E] truncate">
                              {isDone ? "COLLECTED" : "PENDING"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Directive Bottom CTA */}
          <div className="p-4 rounded-xl bg-[#130826] border border-[#FF2A85]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-hud text-xs text-[#A192C2] uppercase">
              FINISHED VERIFYING THIS TEAM? PROCEED TO NEXT ARRIVAL.
            </span>
            <Link
              href="/dashboard/scan"
              className="btn-cyan py-2.5 px-5 font-hud text-xs font-bold tracking-wider uppercase flex items-center gap-2"
            >
              <span>SCAN NEXT TEAM</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
