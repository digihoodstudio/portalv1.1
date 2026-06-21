"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  Upload,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Call logout endpoint (optional but recommended)
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      // Always clear and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Hard redirect to bypass any cached auth state
      window.location.href = "/login";
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/prospects", label: "Prospects", icon: Users },
    { href: "/dashboard/calls", label: "Calls", icon: PhoneCall },
    { href: "/dashboard/import", label: "Import CSV", icon: Upload },
    { href: "/dashboard/notes", label: "Notes", icon: FileText },
    { href: "/dashboard/planner", label: "Daily Planner", icon: Calendar },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-background border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="text-white">
          <span className="font-bold text-sm">DIGIHOOD</span>
          <span className="text-white/40 ml-1 text-xs">STUDIO</span>
        </div>
        <button className="text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              admin@digihoodstudio.com
            </p>
            <p className="text-[10px] text-white/40">Company Admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-bold"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}