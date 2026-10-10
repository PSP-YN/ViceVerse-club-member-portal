"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Megaphone, Bell, Clock, Info } from "lucide-react";

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

export function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to realtime changes on the announcements table
    const channel = supabase
      .channel('announcements_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload) => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAnnouncements() {
    const supabase = createClient();
    const { data } = await supabase
      .from("announcements")
      .select("id, title, message, created_at, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  }

  return (
    <div className="space-y-4 mt-6">
      {announcements.length === 0 ? (
        <div className="rounded p-12 text-center glass-panel border border-white/10">
          <div className="w-12 h-12 rounded flex items-center justify-center mx-auto mb-4 bg-white/5">
            <Megaphone className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-lg font-heading tracking-wider mb-1 text-white">
            No Announcements Yet
          </p>
          <p className="text-sm text-gray-400 font-sans">
            Admin broadcasts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, index) => (
            <article
              key={ann.id}
              className="rounded overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,181,0.2)] glass-panel relative"
              style={{
                border: index === 0
                  ? "1px solid var(--color-neon-pink)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {index === 0 && (
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-neon-pink)] shadow-[0_0_10px_var(--color-neon-pink)]" />
              )}
              {index !== 0 && (
                <div className="absolute top-0 left-0 w-1 h-full bg-white/10" />
              )}
              
              <div className="px-5 py-4 pl-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: index === 0
                        ? "rgba(255, 107, 181, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <Bell
                      className="w-4 h-4"
                      style={{
                        color: index === 0
                          ? "var(--color-neon-pink)"
                          : "rgba(255, 255, 255, 0.5)",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="text-lg font-heading tracking-wide text-white uppercase">
                        {ann.title}
                      </h2>
                      {index === 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0 bg-[var(--color-neon-pink)]/20 text-[var(--color-neon-pink)] border border-[var(--color-neon-pink)]/50 uppercase tracking-widest">
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-gray-300 font-sans">
                      {ann.message}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      <time dateTime={ann.created_at}>{timeAgo(ann.created_at)}</time>
                      <span>•</span>
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

      <p className="text-xs text-center text-gray-500 font-sans mt-6">
        {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} • Auto-updates via Live Telemetry
      </p>
    </div>
  );
}
