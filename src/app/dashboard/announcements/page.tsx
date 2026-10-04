import { createClient } from "@/lib/supabase/server";
import { Megaphone, Bell, Clock, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Announcements | ViceVerse Club Member Portal",
};

async function getAnnouncements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, message, created_at, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export default async function AnnouncementsPage() {
  let announcements: {
    id: string;
    title: string;
    message: string;
    created_at: string;
    is_active: boolean;
  }[] = [];

  try {
    announcements = await getAnnouncements();
  } catch {
    // empty
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-up">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label">Communications</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: "oklch(0.76 0.17 52 / 0.1)",
              border: "1px solid oklch(0.76 0.17 52 / 0.25)",
            }}
          >
            <Megaphone className="w-4.5 h-4.5" style={{ color: "oklch(0.82 0.17 52)" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "oklch(0.94 0.008 240)", letterSpacing: "-0.025em" }}
            >
              Announcements
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.50 0.018 240)" }}>
              Organizer broadcasts — read only
            </p>
          </div>
        </div>
      </div>

      {/* ── Read-only notice ── */}
      <div
        className="flex items-start gap-3 px-3.5 py-3 rounded text-sm"
        style={{
          background: "oklch(0.62 0.18 185 / 0.06)",
          border: "1px solid oklch(0.62 0.18 185 / 0.2)",
        }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.62 0.18 185)" }} />
        <span style={{ color: "oklch(0.62 0.18 185)" }}>
          Club members can view announcements. Only admins can create or modify them.
        </span>
      </div>

      {/* ── Announcements list ── */}
      {announcements.length === 0 ? (
        <div
          className="rounded p-12 text-center"
          style={{
            background: "oklch(0.12 0.012 240)",
            border: "1px solid oklch(0.20 0.012 240)",
          }}
        >
          <div
            className="w-12 h-12 rounded flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.155 0.012 240)" }}
          >
            <Megaphone className="w-6 h-6" style={{ color: "oklch(0.40 0.018 240)" }} />
          </div>
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "oklch(0.70 0.01 240)" }}
          >
            No Announcements Yet
          </p>
          <p className="text-xs" style={{ color: "oklch(0.42 0.018 240)" }}>
            Admin broadcasts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {announcements.map((ann, index) => (
            <article
              key={ann.id}
              className="rounded overflow-hidden transition-colors"
              style={{
                background: "oklch(0.12 0.012 240)",
                border: index === 0
                  ? "1px solid oklch(0.76 0.17 52 / 0.3)"
                  : "1px solid oklch(0.20 0.012 240)",
                borderLeft: index === 0
                  ? "3px solid oklch(0.76 0.17 52)"
                  : "3px solid oklch(0.22 0.012 240)",
              }}
            >
              <div className="px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: index === 0
                        ? "oklch(0.76 0.17 52 / 0.12)"
                        : "oklch(0.155 0.012 240)",
                    }}
                  >
                    <Bell
                      className="w-3.5 h-3.5"
                      style={{
                        color: index === 0
                          ? "oklch(0.82 0.17 52)"
                          : "oklch(0.45 0.018 240)",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2
                        className="text-sm font-semibold leading-tight"
                        style={{ color: "oklch(0.92 0.008 240)" }}
                      >
                        {ann.title}
                      </h2>
                      {index === 0 && (
                        <span
                          className="text-[0.6rem] font-mono font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{
                            background: "oklch(0.76 0.17 52 / 0.12)",
                            color: "oklch(0.82 0.17 52)",
                            border: "1px solid oklch(0.76 0.17 52 / 0.3)",
                          }}
                        >
                          LATEST
                        </span>
                      )}
                    </div>

                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "oklch(0.58 0.018 240)" }}
                    >
                      {ann.message}
                    </p>

                    <div
                      className="flex items-center gap-1.5 mt-2 text-xs"
                      style={{ color: "oklch(0.42 0.018 240)" }}
                    >
                      <Clock className="w-3 h-3" />
                      <time dateTime={ann.created_at}>{timeAgo(ann.created_at)}</time>
                      <span>·</span>
                      <span>
                        {new Date(ann.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: "oklch(0.35 0.012 240)" }}>
        {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} · Auto-refreshes on page load
      </p>
    </div>
  );
}
