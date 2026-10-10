"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import QRCode from "qrcode";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    const { data } = await supabase
      .from("teams")
      .select("*, members(id, name, role)")
      .order("created_at", { ascending: false });
    if (data) setTeams(data);
    setLoading(false);
  }

  async function generateQR(teamId: string, qrToken: string) {
    if (!qrToken) return;
    try {
      const url = await QRCode.toDataURL(qrToken, { width: 200, margin: 2, color: { dark: '#00F0FF', light: '#090514' } });
      setQrCodeUrls(prev => ({ ...prev, [teamId]: url }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleTogglePayment(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    await supabase.from("teams").update({ payment_status: newStatus }).eq("id", id);
    fetchTeams();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <h2 className="font-gta text-3xl uppercase tracking-wider text-white">Team Management & QR Engine</h2>
      
      <div className="space-y-4">
        {loading ? <p>Loading teams...</p> : teams.map(team => (
          <div key={team.id} className="p-6 bg-[#120924] border border-[#FFB800]/30 rounded-xl flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2 py-1 bg-[#FF2A85]/20 text-[#FF2A85] rounded">{team.team_id}</span>
                <h4 className="text-2xl font-heading text-white">{team.team_name}</h4>
              </div>
              <p className="text-sm text-[#A192C2]">Domain: {team.domain}</p>
              <p className="text-sm text-[#00F0FF]">Payment: {team.payment_status}</p>
              <div className="mt-4">
                <h5 className="font-hud text-xs text-white uppercase mb-2">Dossier ({team.members?.length || 0}/3)</h5>
                <ul className="text-xs text-gray-400 space-y-1">
                  {team.members?.map((m: any) => (
                    <li key={m.id}>- {m.name} ({m.role})</li>
                  ))}
                </ul>
              </div>
              <div className="pt-4">
                <button onClick={() => handleTogglePayment(team.id, team.payment_status)} className="px-3 py-1 text-xs border border-[#FFB800] text-[#FFB800] rounded hover:bg-[#FFB800]/20">
                  Toggle Payment Status
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 bg-[#090514] p-4 rounded-xl border border-white/10">
              <h5 className="font-hud text-xs text-[#A192C2] uppercase">Access Token</h5>
              <div className="font-mono text-[10px] text-gray-500 break-all w-48 text-center">{team.qr_token}</div>
              {qrCodeUrls[team.id] ? (
                <img src={qrCodeUrls[team.id]} alt="Team QR" className="w-32 h-32 rounded border border-[#00F0FF]/50" />
              ) : (
                <button onClick={() => generateQR(team.id, team.qr_token)} className="px-4 py-2 bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF] rounded font-hud text-xs uppercase hover:bg-[#00F0FF]/40">
                  Generate Secure QR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
