import { createClient } from "@/lib/supabase/server";
import { Megaphone, Bell, Clock } from "lucide-react";

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
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl vv-gradient flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Read-only — organizer communications
          </p>
        </div>
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/60 border border-border text-sm text-muted-foreground">
        <Bell className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
        <span>
          You can view and read announcements. Only admins can create, edit, or
          delete announcements.
        </span>
      </div>

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No Announcements Yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Check back later. Admin announcements will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, index) => (
            <article
              key={ann.id}
              className={`glass-card rounded-2xl p-5 border transition-all hover:border-primary/20 ${
                index === 0
                  ? "border-yellow-800/40 bg-yellow-950/10"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                    index === 0
                      ? "bg-yellow-950 text-yellow-400"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Bell className="w-4.5 h-4.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h2 className="font-semibold text-foreground text-base leading-tight">
                      {ann.title}
                    </h2>
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-950 text-yellow-400 border border-yellow-800 flex-shrink-0">
                        Latest
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {ann.message}
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <time dateTime={ann.created_at}>{timeAgo(ann.created_at)}</time>
                    <span className="mx-1">·</span>
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
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground pb-4">
        {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} shown &middot; Auto-refreshes on page load
      </p>
    </div>
  );
}
