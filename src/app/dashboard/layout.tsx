"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  QrCode,
  Users,
  Megaphone,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Radio,
  Zap,
} from "lucide-react";
import { useState } from "react";
import ViceVerseLogo from "@/components/ViceVerseLogo";

const navItems = [
  {
    href: "/dashboard",
    label: "Mission Hub",
    sublabel: "Overview & Metrics",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/scan",
    label: "Target QR Scan",
    sublabel: "HUD Camera Scanner",
    icon: QrCode,
  },
  {
    href: "/dashboard/team",
    label: "Team Dossier",
    sublabel: "Manual Lookup & Acts",
    icon: Users,
  },
  {
    href: "/dashboard/operations",
    label: "Operations Dispatch",
    sublabel: "Live Telemetry & Logs",
    icon: BarChart3,
  },
  {
    href: "/dashboard/announcements",
    label: "Radio Alerts",
    sublabel: "Organizer Broadcasts",
    icon: Megaphone,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = "vv_demo_auth=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Wanted level status banner */}
      <div className="px-4 py-2 mb-2 bg-[#170B2F] border-y border-[#FF2A85]/20 flex items-center justify-between">
        <span className="font-hud text-[0.6875rem] font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#FFB800] fill-current" />
          CREW LEVEL 5
        </span>
        <div className="flex gap-0.5 text-[#FFB800] text-[0.65rem]">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="drop-shadow-[0_0_4px_rgba(255,184,0,0.8)]">★</span>
          ))}
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pb-2 pt-1">
        <p className="font-hud text-[0.6875rem] font-bold text-[#00F0FF] tracking-[0.16em] uppercase">
          OPERATIONAL DIRECTIVES
        </p>
      </div>

      <nav
        className="flex-1 px-3 space-y-1.5 overflow-y-auto"
        role="navigation"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded text-sm font-hud font-bold tracking-wide uppercase
                transition-all duration-150 group relative
                ${active
                  ? "bg-gradient-to-r from-[#FF2A85]/25 to-transparent text-[#FF2A85] border-l-4 border-[#FF2A85] shadow-[inset_0_0_15px_rgba(255,42,133,0.12)]"
                  : "text-[#A192C2] hover:text-white hover:bg-[#1B1038] hover:border-l-2 hover:border-[#00F0FF]"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? "text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" : "text-[#A192C2] group-hover:text-[#00F0FF]"
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className={`block leading-tight ${active ? "text-white font-gta text-base tracking-wider" : ""}`}>
                  {item.label}
                </span>
                <span className="block text-[0.65rem] text-[#6E5B8E] group-hover:text-[#A192C2] font-hud tracking-normal lowercase leading-tight">
                  {item.sublabel}
                </span>
              </div>
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-[#00F0FF] flex-shrink-0 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: logout + build info */}
      <div className="px-3 pb-4 pt-3 mt-2 border-t border-[#FF2A85]/20 bg-[#0C061A]">
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded font-hud font-bold text-xs uppercase tracking-wider
            text-[#A192C2] hover:text-[#FF2244] hover:bg-[#FF2244]/10 hover:border hover:border-[#FF2244]/40 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          ABORT SHIFT (LOGOUT)
        </button>

        <div className="mt-3 px-3 py-2 rounded bg-[#130926] border border-[#FF2A85]/15">
          <p className="font-hud text-[0.65rem] font-bold text-[#00F0FF] uppercase tracking-wider">
            VICE CITY CREW // TEAM 4
          </p>
          <p className="font-mono text-[0.65rem] text-[#A192C2] mt-0.5">
            Puttashankar · Prasiddh · Bidappa
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#090514] text-slate-100">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-[#0C061A] border-r border-[#FF2A85]/20 shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
        {/* Logo area */}
        <div className="p-4 border-b border-[#FF2A85]/20 bg-[#120826]">
          <ViceVerseLogo size="md" showSubtitle={true} />
        </div>

        {/* Live Status Chip */}
        <div className="px-4 py-2.5 border-b border-[#FF2A85]/20 bg-[#0E0720]">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#1A0E38] border border-[#00F0FF]/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
              <span className="font-hud text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
                RADAR ACTIVE
              </span>
            </div>
            <span className="font-mono text-[0.65rem] text-[#FFB800] bg-[#FFB800]/10 px-1.5 py-0.5 rounded">
              LIVE OPS
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden py-3">
          <NavContent />
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative z-10 w-72 flex flex-col bg-[#0C061A] border-r border-[#FF2A85]/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#FF2A85]/20 bg-[#120826]">
              <ViceVerseLogo size="sm" showSubtitle={false} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded bg-[#1B1038] text-[#A192C2] hover:text-white hover:bg-[#FF2A85]/20 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5 text-[#00F0FF]" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden py-3">
              <NavContent onClose={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-[#0C061A]/95 border-b border-[#FF2A85]/20 backdrop-blur-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded bg-[#1A0E38] border border-[#FF2A85]/30 text-[#00F0FF] flex items-center justify-center hover:bg-[#FF2A85]/20 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <ViceVerseLogo size="sm" showSubtitle={false} />

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A0E38] border border-[#00F0FF]/40 text-[#00F0FF] font-hud text-xs font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
            LIVE
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8 max-w-[1300px] w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
