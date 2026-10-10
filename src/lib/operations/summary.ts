import { z } from "zod";
import {
  ACTIVITIES,
  LIVE_WINDOW_MINUTES,
  PENDING_TEAMS_LIMIT,
  type Activity,
} from "./config";

/* -------------------------------------------------------------------------
 * Row schemas — validate what Supabase returns instead of trusting casts.
 * ---------------------------------------------------------------------- */

const memberRowSchema = z.object({
  id: z.string(),
  registration_status: z.boolean(),
  goodies_status: z.boolean(),
  lunch_status: z.boolean(),
  snacks_status: z.boolean(),
});

export const teamRowSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  team_name: z.string(),
  members: z.array(memberRowSchema),
});

export const auditRowSchema = z.object({
  id: z.string(),
  performed_by_name: z.string().nullable(),
  activity: z.enum(ACTIVITIES),
  action: z.string(),
  timestamp: z.string(),
  team: z.object({ team_id: z.string(), team_name: z.string() }).nullable(),
  member: z.object({ name: z.string() }).nullable(),
});

export type TeamRow = z.infer<typeof teamRowSchema>;
export type AuditRow = z.infer<typeof auditRowSchema>;

/* -------------------------------------------------------------------------
 * Summary types
 * ---------------------------------------------------------------------- */

export interface ActivityProgress {
  activity: Activity;
  completed: number;
  total: number;
  pending: number;
  percent: number;
}

export interface PendingTeam {
  id: string;
  teamId: string;
  teamName: string;
  pendingMembers: number;
  memberCount: number;
}

export type OperationsState =
  | "live"
  | "standby"
  | "not_started"
  | "complete"
  | "no_teams";

export interface OperationsSummary {
  teams: { processed: number; total: number; percent: number };
  totalMembers: number;
  activities: Record<Activity, ActivityProgress>;
  /** Teams with at least one member not yet registered (capped for display). */
  pendingTeams: PendingTeam[];
  pendingTeamCount: number;
  lastActivityAt: string | null;
  state: OperationsState;
}

/* -------------------------------------------------------------------------
 * Calculations (pure — easy to reason about and test)
 * ---------------------------------------------------------------------- */

/**
 * Whole-number percentage that never shows 100% until the work is truly
 * done (a plain Math.round would turn 199/200 into 100%).
 */
export function toPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  if (completed >= total) return 100;
  return Math.min(99, Math.round((completed / total) * 100));
}

const STATUS_FIELD: Record<Activity, keyof TeamRow["members"][number]> = {
  registration: "registration_status",
  goodies: "goodies_status",
  lunch: "lunch_status",
  snacks: "snacks_status",
};

/**
 * Builds the dashboard summary from approved teams (with their members) and
 * the most recent audit entries.
 *
 * Every figure is derived from the same list of approved teams, so members
 * of teams that are not approved can never inflate totals or percentages.
 */
export function buildSummary(
  teams: TeamRow[],
  recentLogs: AuditRow[],
  now: Date
): OperationsSummary {
  const allMembers = teams.flatMap((team) => team.members);
  const totalMembers = allMembers.length;

  const activities = {} as Record<Activity, ActivityProgress>;
  for (const activity of ACTIVITIES) {
    const field = STATUS_FIELD[activity];
    const completed = allMembers.filter((member) => member[field] === true).length;
    activities[activity] = {
      activity,
      completed,
      total: totalMembers,
      pending: totalMembers - completed,
      percent: toPercent(completed, totalMembers),
    };
  }

  // A team counts as processed once every one of its members is registered.
  const eligibleTeams = teams.filter((team) => team.members.length > 0);
  const processed = eligibleTeams.filter((team) =>
    team.members.every((member) => member.registration_status)
  ).length;

  const pendingTeamsAll: PendingTeam[] = eligibleTeams
    .map((team) => ({
      id: team.id,
      teamId: team.team_id,
      teamName: team.team_name,
      memberCount: team.members.length,
      pendingMembers: team.members.filter((member) => !member.registration_status)
        .length,
    }))
    .filter((team) => team.pendingMembers > 0)
    .sort((a, b) => a.teamId.localeCompare(b.teamId, undefined, { numeric: true }));

  const lastActivityAt = recentLogs[0]?.timestamp ?? null;

  return {
    teams: {
      processed,
      total: eligibleTeams.length,
      percent: toPercent(processed, eligibleTeams.length),
    },
    totalMembers,
    activities,
    pendingTeams: pendingTeamsAll.slice(0, PENDING_TEAMS_LIMIT),
    pendingTeamCount: pendingTeamsAll.length,
    lastActivityAt,
    state: deriveState(activities, totalMembers, lastActivityAt, now),
  };
}

/**
 * Derives the operating state purely from existing data — nothing is stored
 * for it. "Live" means a Club Member recorded something recently.
 */
export function deriveState(
  activities: Record<Activity, ActivityProgress>,
  totalMembers: number,
  lastActivityAt: string | null,
  now: Date
): OperationsState {
  if (totalMembers === 0) return "no_teams";

  const list = Object.values(activities);
  if (list.every((item) => item.completed >= item.total)) return "complete";

  if (lastActivityAt) {
    const ageMs = now.getTime() - new Date(lastActivityAt).getTime();
    if (ageMs <= LIVE_WINDOW_MINUTES * 60_000) return "live";
    return "standby";
  }

  return list.some((item) => item.completed > 0) ? "standby" : "not_started";
}

/* -------------------------------------------------------------------------
 * Formatting helpers
 * ---------------------------------------------------------------------- */

export function formatRelativeTime(iso: string, now: Date): string {
  const diffSeconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000);
  // Clock skew between devices can put a timestamp slightly in the future.
  if (diffSeconds < 60) return "Just now";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}
