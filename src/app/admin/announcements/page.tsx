"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return alert("Not authenticated");

    const { error } = await supabase.from("announcements").insert({
      title,
      message,
      created_by: userData.user.id,
      is_active: true
    });
    if (error) alert("Error creating: " + error.message);
    else {
      setTitle("");
      setMessage("");
      fetchAnnouncements();
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    await supabase.from("announcements").update({ is_active: !currentStatus }).eq("id", id);
    fetchAnnouncements();
  }

  async function handleDelete(id: string) {
    if (confirm("Delete announcement?")) {
      await supabase.from("announcements").delete().eq("id", id);
      fetchAnnouncements();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <h2 className="font-gta text-3xl uppercase tracking-wider text-white">Announcement Management</h2>
      
      <div className="p-6 bg-[#120924] border border-[#FF2A85]/30 rounded-xl space-y-4">
        <h3 className="font-hud text-lg text-[#00F0FF] uppercase">Create New Announcement</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-hud text-[#A192C2] uppercase mb-1">Title</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1C0E38] border border-[#FF2A85]/30 rounded p-2 text-white font-sans"
            />
          </div>
          <div>
            <label className="block text-xs font-hud text-[#A192C2] uppercase mb-1">Message</label>
            <textarea 
              required value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              className="w-full bg-[#1C0E38] border border-[#FF2A85]/30 rounded p-2 text-white font-sans"
            />
          </div>
          <button type="submit" className="bg-[#FF2A85] text-white px-6 py-2 rounded font-hud uppercase tracking-widest text-sm hover:bg-[#FF0055]">
            Broadcast Announcement
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-hud text-lg text-[#FFB800] uppercase">Existing Announcements</h3>
        {loading ? <p>Loading...</p> : announcements.map(ann => (
          <div key={ann.id} className="p-4 bg-[#120924] border border-white/10 rounded-xl flex justify-between items-start">
            <div>
              <h4 className="text-xl font-heading text-white">{ann.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{ann.message}</p>
              <p className="text-xs text-[#00F0FF] mt-2">Active: {ann.is_active ? "YES" : "NO"} | Created: {new Date(ann.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 flex-col">
              <button onClick={() => handleToggleActive(ann.id, ann.is_active)} className="px-3 py-1 text-xs border border-[#00F0FF] text-[#00F0FF] rounded hover:bg-[#00F0FF]/20">
                Toggle Active
              </button>
              <button onClick={() => handleDelete(ann.id)} className="px-3 py-1 text-xs border border-[#FF2A85] text-[#FF2A85] rounded hover:bg-[#FF2A85]/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
