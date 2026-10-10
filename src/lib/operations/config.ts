import { Coffee, Cookie, Gift, UserCheck, type LucideIcon } from "lucide-react";

export const ACTIVITIES = ["registration", "goodies", "lunch", "snacks"] as const;
export type Activity = (typeof ACTIVITIES)[number];

interface ActivityMeta {
  /** Short noun used for section titles ("Registration"). */
  label: string;
  /** Text used in the activity feed ("Goodies distributed"). */
  completedText: string;
  /** Label for metric cards ("Members Registered"). */
  metricLabel: string;
  icon: LucideIcon;
}

export const ACTIVITY_META: Record<Activity, ActivityMeta> = {
  registration: {
    label: "Registration",
    completedText: "Registration completed",
    metricLabel: "Members Registered",
    icon: UserCheck,
  },
  goodies: {
    label: "Goodies",
    completedText: "Goodies distributed",
    metricLabel: "Goodies Distributed",
    icon: Gift,
  },
  lunch: {
    label: "Lunch",
    completedText: "Lunch distributed",
    metricLabel: "Lunch Distributed",
    icon: Coffee,
  },
  snacks: {
    label: "Snacks",
    completedText: "Snacks distributed",
    metricLabel: "Snacks Distributed",
    icon: Cookie,
  },
};

/** Operations show as LIVE if an audit entry was recorded within this window. */
export const LIVE_WINDOW_MINUTES = 15;

/** Browser refresh cadence for the dashboard (seconds). */
export const AUTO_REFRESH_SECONDS = 30;

/** How many audit entries the activity feed shows. */
export const RECENT_ACTIVITY_LIMIT = 10;

/** How many "awaiting check-in" teams are listed before collapsing to "+N more". */
export const PENDING_TEAMS_LIMIT = 6;

/** Event timezone, used for absolute timestamps so server and viewer agree. */
export const EVENT_TIME_ZONE = "Asia/Kolkata";
