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
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/scan",
    label: "Scan Team QR",
    icon: QrCode,
  },
  {
    href: "/dashboard/team",
    label: "Team Lookup",
    icon: Users,
  },
  {
    href: "/dashboard/announcements",
    label: "Announcements",
    icon: Megaphone,
  },
  {
    href: "/dashboard/operations",
    label: "Operations Status",
    icon: BarChart3,
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
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              active
                ? "nav-item-active text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            {item.label}
            {active && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg vv-gradient flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm vv-gradient-text">ViceVerse</p>
            <p className="text-xs text-muted-foreground">Club Member Portal</p>
          </div>
        </div>

        <NavLinks />

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-64 flex flex-col bg-sidebar border-r border-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg vv-gradient flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm vv-gradient-text">ViceVerse</p>
                  <p className="text-xs text-muted-foreground">Club Member</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <NavLinks />
            <div className="p-3 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="w-4.5 h-4.5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md vv-gradient flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm vv-gradient-text">ViceVerse</span>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 xl:p-8">{children}</div>
      </main>
    </div>
  );
}
