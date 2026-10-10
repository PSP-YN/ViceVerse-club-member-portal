export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090514] text-white flex flex-col">
      <header className="border-b border-[#00F0FF]/30 bg-[#120924] px-6 py-4 flex items-center justify-between">
        <h1 className="font-gta text-2xl text-[#00F0FF] tracking-widest uppercase">
          VICEVERSE ADMIN <span className="text-[#FF2A85]">CENTRAL</span>
        </h1>
        <nav className="flex gap-4 font-hud text-xs font-bold tracking-wider uppercase">
          <a href="/admin/announcements" className="text-[#A192C2] hover:text-[#00F0FF]">Announcements</a>
          <a href="/admin/users" className="text-[#A192C2] hover:text-[#00F0FF]">Users</a>
          <a href="/admin/teams" className="text-[#A192C2] hover:text-[#00F0FF]">Teams & QR</a>
          <a href="/admin/operations" className="text-[#A192C2] hover:text-[#00F0FF]">Operations</a>
          <a href="/dashboard" className="text-[#FFB800] hover:text-white">Exit to Portal</a>
        </nav>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
