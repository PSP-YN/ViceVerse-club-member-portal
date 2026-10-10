import Link from "next/link";
import { QrCode, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AUTO_REFRESH_SECONDS } from "@/lib/operations/config";
import type { ClubMemberInfo } from "@/lib/operations/data";
import type { OperationsState } from "@/lib/operations/summary";
import { AutoRefresh } from "./auto-refresh";
import { LogoutButton } from "./logout-button";
import { StatusBadge } from "./status-badge";

interface OperationsHeaderProps {
  member: ClubMemberInfo;
  state: OperationsState;
  updatedLabel: string;
}

export function OperationsHeader({ member, state, updatedLabel }: OperationsHeaderProps) {
  const initial = member.name.trim().charAt(0).toUpperCase() || "C";

  return (
    <header className="space-y-5">
      {/* Brand + signed-in Club Member */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-foreground">ViceVerse</span>
          <span aria-hidden="true" className="mx-2">
            ·
          </span>
          Club Member Portal
        </p>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
            >
              {initial}
            </span>
            <div className="hidden min-w-0 leading-tight sm:block">
              <p className="max-w-48 truncate text-sm font-medium">{member.name}</p>
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {member.email || "Club Member"}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Title + status + quick actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Event Operations</h1>
            <StatusBadge state={state} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time event-day operations overview
          </p>
        </div>

        <nav aria-label="Quick actions" className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/scan" className={buttonVariants({ size: "lg" })}>
            <QrCode aria-hidden="true" />
            Scan Team QR
          </Link>
          <Link
            href="/dashboard/team"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Search aria-hidden="true" />
            Find Team
          </Link>
        </nav>
      </div>

      <AutoRefresh intervalSeconds={AUTO_REFRESH_SECONDS} updatedLabel={updatedLabel} />
    </header>
  );
}
