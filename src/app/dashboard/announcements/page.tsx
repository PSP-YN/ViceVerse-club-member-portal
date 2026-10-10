import { createClient } from "@/lib/supabase/server";
import { Megaphone, Info } from "lucide-react";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const revalidate = 0; // Disable static caching so we get fresh data on initial load, then realtime takes over

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

export default async function AnnouncementsPage() {
  let announcements: any[] = [];
  try {
    announcements = await getAnnouncements();
  } catch {
    // empty
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-up pt-4">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label text-[var(--color-neon-cyan)] uppercase tracking-wider text-sm">Communications</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255, 107, 181, 0.1)",
              border: "1px solid var(--color-neon-pink)",
            }}
          >
            <Megaphone className="w-5 h-5" style={{ color: "var(--color-neon-pink)" }} />
          </div>
          <div>
            <h1 className="text-3xl font-heading tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(255,107,181,0.6)]">
              Announcements
            </h1>
            <p className="text-sm text-gray-400 font-sans">
              Organizer broadcasts — read only
            </p>
          </div>
        </div>
      </div>

      {/* ── Read-only notice ── */}
      <div className="flex items-start gap-3 px-3.5 py-3 rounded text-sm glass-panel border border-[var(--color-neon-cyan)]/30">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-neon-cyan)]" />
        <span className="text-[var(--color-neon-cyan)] font-sans">
          Club members can view announcements. Only admins can create or modify them.
        </span>
      </div>

      {/* ── Realtime Announcements Client ── */}
      <AnnouncementsClient initialAnnouncements={announcements} />
    </div>
  );
}
