import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { RECENT_ACTIVITY_LIMIT } from "./config";
import {
  auditRowSchema,
  buildSummary,
  teamRowSchema,
  type AuditRow,
  type OperationsSummary,
  type TeamRow,
} from "./summary";

/* -------------------------------------------------------------------------
 * Access check — runs on the server before any operations data is read.
 * ---------------------------------------------------------------------- */

export interface ClubMemberInfo {
  id: string;
  name: string;
  email: string;
}

export type ClubMemberAccess =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "ok"; member: ClubMemberInfo };

/**
 * Confirms the caller is a signed-in Club Member. This mirrors the check in
 * the existing API routes (profiles.role === "club_member") so the dashboard
 * never relies on the UI — or on RLS alone — to keep other roles out.
 */
export async function getClubMemberAccess(
  supabase: SupabaseClient
): Promise<ClubMemberAccess> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { status: "unauthenticated" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw new Error("Failed to load profile");
  if (!profile || profile.role !== "club_member") return { status: "forbidden" };

  const email = user.email ?? "";
  return {
    status: "ok",
    member: {
      id: user.id,
      name: profile.full_name || email || "Club Member",
      email,
    },
  };
}

/* -------------------------------------------------------------------------
 * Operations data
 * ---------------------------------------------------------------------- */

export interface OperationsSnapshot {
  summary: OperationsSummary;
  recentLogs: AuditRow[];
  generatedAt: Date;
}

/**
 * Approved teams with their members. Members are embedded through the
 * members.team_id → teams.id relationship, so every member figure derived
 * from this list covers approved teams only (members of pending or rejected
 * teams can never inflate totals).
 *
 * Throws on any query or validation failure.
 */
export async function getApprovedTeams(supabase: SupabaseClient): Promise<TeamRow[]> {
  const { data, error } = await supabase
    .from("teams")
    .select(
      "id, team_id, team_name, members(id, registration_status, goodies_status, lunch_status, snacks_status)"
    )
    .eq("payment_status", "approved");

  if (error) {
    console.error("Operations: teams query failed", error);
    throw new Error("Failed to load teams");
  }
  return z.array(teamRowSchema).parse(data ?? []);
}

/**
 * Latest audit entries, newest first. Embeds the team (teams.team_id, e.g.
 * IDN26-042) and the member's name. No emails or phone numbers are selected.
 */
async function getRecentAuditLogs(supabase: SupabaseClient): Promise<AuditRow[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, performed_by_name, activity, action, timestamp, team:teams(team_id, team_name), member:members(name)"
    )
    .order("timestamp", { ascending: false })
    .limit(RECENT_ACTIVITY_LIMIT);

  if (error) {
    console.error("Operations: audit_logs query failed", error);
    throw new Error("Failed to load recent activity");
  }
  return z.array(auditRowSchema).parse(data ?? []);
}

/**
 * Loads everything the Operations Dashboard shows in two parallel queries.
 * Throws on failure so the route's error boundary shows a real error state
 * instead of silently displaying zeros.
 */
export async function getOperationsSnapshot(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<OperationsSnapshot> {
  const [teams, recentLogs] = await Promise.all([
    getApprovedTeams(supabase),
    getRecentAuditLogs(supabase),
  ]);

  return {
    summary: buildSummary(teams, recentLogs, now),
    recentLogs,
    generatedAt: now,
  };
}
