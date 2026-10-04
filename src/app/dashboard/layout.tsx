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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    description: "Overview",
  },
  {
    href: "/dashboard/scan",
    label: "Scan Team QR",
    icon: QrCode,
    description: "Camera scanner",
  },
  {
    href: "/dashboard/team",
    label: "Team Lookup",
    icon: Users,
    description: "Manual search",
  },
  {
    href: "/dashboard/announcements",
    label: "Announcements",
    icon: Megaphone,
    description: "Organizer alerts",
  },
  {
    href: "/dashboard/operations",
    label: "Operations",
    icon: BarChart3,
    description: "Live monitoring",
  },
];

/* ── ViceVerse hex logo mark ── */
function HexLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <polygon
        points="18,2 34,10 34,26 18,34 2,26 2,10"
        fill="none"
        stroke="oklch(0.76 0.17 52)"
        strokeWidth="1.5"
      />
      <polygon
        points="18,8 28,13.5 28,24.5 18,30 8,24.5 8,13.5"
        fill="oklch(0.76 0.17 52 / 0.08)"
        stroke="oklch(0.76 0.17 52 / 0.35)"
        strokeWidth="1"
      />
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fill="oklch(0.82 0.17 52)"
        fontSize="10"
        fontWeight="700"
        fontFamily="Inter"
      >
        V
      </text>
    </svg>
  );
}

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
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Nav section label */}
      <div className="px-4 pb-2 pt-1">
        <p className="mono-label">Navigation</p>
      </div>

      <nav
        className="flex-1 px-2 space-y-0.5 overflow-y-auto"
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
                flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium
                transition-all duration-150 group relative
                ${active
                  ? "nav-active"
                  : "text-[oklch(0.52_0.018_240)] hover:text-[oklch(0.85_0.01_240)] hover:bg-[oklch(0.155_0.012_240)]"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? "text-[oklch(0.82_0.17_52)]" : "text-[oklch(0.45_0.018_240)] group-hover:text-[oklch(0.75_0.01_240)]"
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className={`block leading-tight ${active ? "text-[oklch(0.82_0.17_52)]" : ""}`}>
                  {item.label}
                </span>
                {!active && (
                  <span className="block text-[0.65rem] text-[oklch(0.40_0.012_240)] leading-tight mt-0.5">
                    {item.description}
                  </span>
                )}
              </div>
              {active && (
                <ChevronRight className="w-3 h-3 text-[oklch(0.76_0.17_52)] flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: logout + build info */}
      <div
        className="px-2 pb-4 pt-3 mt-2"
        style={{ borderTop: "1px solid oklch(0.18 0.012 240)" }}
      >
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm font-medium
            text-[oklch(0.45_0.018_240)] hover:text-[oklch(0.68_0.22_22)]
            hover:bg-[oklch(0.58_0.22_22_/_0.08)] transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>

        <div className="mt-3 px-3">
          <p className="mono-label mb-0.5">Build</p>
          <p className="text-xs" style={{ color: "oklch(0.35 0.012 240)" }}>
            ViceVerse v2.0 · Team 4
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 z-40"
        style={{
          background: "oklch(0.105 0.012 240)",
          borderRight: "1px solid oklch(0.185 0.012 240)",
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
        >
          <HexLogo size={30} />
          <div className="min-w-0">
            <p
              className="text-sm font-bold leading-tight"
              style={{ color: "oklch(0.92 0.008 240)", letterSpacing: "-0.02em" }}
            >
              ViceVerse
            </p>
            <p className="text-xs leading-tight" style={{ color: "oklch(0.45 0.018 240)" }}>
              Club Member Portal
            </p>
          </div>
        </div>

        {/* Status chip */}
        <div className="px-4 py-2.5" style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}>
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded"
            style={{
              background: "oklch(0.65 0.18 150 / 0.08)",
              border: "1px solid oklch(0.65 0.18 150 / 0.2)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-soft-pulse flex-shrink-0" />
            <span className="text-xs font-medium" style={{ color: "oklch(0.68 0.18 150)" }}>
              Ideathon — Live
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
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            className="relative z-10 w-60 flex flex-col shadow-2xl"
            style={{
              background: "oklch(0.105 0.012 240)",
              borderRight: "1px solid oklch(0.185 0.012 240)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid oklch(0.185 0.012 240)" }}
            >
              <div className="flex items-center gap-2.5">
                <HexLogo size={26} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "oklch(0.92 0.008 240)" }}>
                    ViceVerse
                  </p>
                  <p className="text-xs" style={{ color: "oklch(0.45 0.018 240)" }}>
                    Club Member
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded hover:bg-[oklch(0.155_0.012_240)] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" style={{ color: "oklch(0.55 0.018 240)" }} />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden py-3">
              <NavContent onClose={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14"
          style={{
            background: "oklch(0.105 0.012 240 / 0.9)",
            borderBottom: "1px solid oklch(0.185 0.012 240)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded hover:bg-[oklch(0.155_0.012_240)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" style={{ color: "oklch(0.60 0.018 240)" }} />
          </button>

          <div className="flex items-center gap-2">
            <HexLogo size={22} />
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.90 0.008 240)", letterSpacing: "-0.02em" }}
            >
              ViceVerse
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
              style={{
                background: "oklch(0.65 0.18 150 / 0.08)",
                border: "1px solid oklch(0.65 0.18 150 / 0.2)",
                color: "oklch(0.68 0.18 150)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-soft-pulse" />
              Live
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8 max-w-[1200px] w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
