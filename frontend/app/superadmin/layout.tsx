"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Phone,
  FileText,
  Upload,
  StickyNote,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Calendar,
} from "lucide-react";

const navItems = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/clients", label: "Clients", icon: Users },
  { href: "/superadmin/calls", label: "Calls", icon: Phone },
  { href: "/superadmin/import", label: "Import CSV", icon: Upload },
  { href: "/superadmin/notes", label: "Notes", icon: StickyNote },
  { href: "/superadmin/planner", label: "Daily Planner", icon: Calendar },
  { href: "/superadmin/reports", label: "Reports", icon: BarChart3 },
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside
        className={`${collapsed ? "w-20" : "w-64"} sticky top-0 h-screen border-r border-white/10 bg-[#06101f]/80 backdrop-blur-xl transition-all duration-300 flex flex-col`}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold">
                Digihood
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">Studio</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-950/20"
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
