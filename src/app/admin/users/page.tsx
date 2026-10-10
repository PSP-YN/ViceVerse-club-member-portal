"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  async function handleUpdateRole(id: string, newRole: string) {
    if (confirm(`Change role to ${newRole}?`)) {
      await supabase.from("profiles").update({ role: newRole }).eq("id", id);
      fetchUsers();
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <h2 className="font-gta text-3xl uppercase tracking-wider text-white">User Provisioning</h2>
      
      <div className="p-6 bg-[#120924] border border-[#00F0FF]/30 rounded-xl space-y-4">
        <h3 className="font-hud text-lg text-[#00F0FF] uppercase">Registered Profiles</h3>
        {loading ? <p>Loading users...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm text-gray-300">
              <thead className="font-hud text-xs text-[#A192C2] uppercase border-b border-[#00F0FF]/30">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-[10px] text-[#FF2A85]">{u.id}</td>
                    <td className="py-3 px-4">{u.full_name || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${u.role === 'club_member' ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'bg-gray-800'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex gap-2 justify-end">
                      <button onClick={() => handleUpdateRole(u.id, 'club_member')} className="px-3 py-1 text-xs border border-[#00F0FF] text-[#00F0FF] rounded hover:bg-[#00F0FF]/20">Make Club Member</button>
                      <button onClick={() => handleUpdateRole(u.id, 'user')} className="px-3 py-1 text-xs border border-gray-500 text-gray-400 rounded hover:bg-gray-800">Revoke Access</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
