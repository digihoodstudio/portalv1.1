"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Phone,
  Upload,
  StickyNote,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import ProfileModal from "../../components/ProfileModal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/prospects", label: "Prospects", icon: Users },
  { href: "/dashboard/calls", label: "Calls", icon: Phone },
  { href: "/dashboard/import", label: "Import CSV", icon: Upload },
  { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
  { href: "/dashboard/planner", label: "Daily Planner", icon: Calendar },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Admin");
  const [profileOpen, setProfileOpen] = useState(false);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name || "Admin");
        const r = (u.role || "").toUpperCase();
        if (r === "SUPERADMIN") setUserRole("Super Admin");
        else if (r === "ADMIN") setUserRole("Admin");
        else if (r === "AGENT") setUserRole("Outbound Agent");
        else if (r === "TEAMLEADER") setUserRole("Team Leader");
        else if (r === "EMPLOYEE") setUserRole("Employee");
        else setUserRole("Client Portal");
      } catch {}
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={`${collapsed ? "w-20" : "w-64"} flex-shrink-0 border-r border-white/10 dark:bg-[#06101f]/80 bg-surface-elevated backdrop-blur-xl transition-all duration-300 flex flex-col sticky top-0 h-screen`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/digilogo.png"
              alt="Digihood Studio"
              width={32}
              height={32}
              className="rounded-full object-cover flex-shrink-0"
            />
            {!collapsed && (
              <span className="flex flex-col leading-tight">
                <span className="text-[0.45em] text-white tracking-[0.2em] uppercase">Portal by</span>
                <span className="font-monument text-xs tracking-[0.24em] text-white">
                  DIGIHOOD<span className="text-[0.6em] text-white/60 ml-1">STUDIO</span>
                </span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 text-heading/60 hover:bg-white/5 hover:text-heading"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                  active
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-heading/70 hover:bg-white/5 hover:text-heading border border-transparent"
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-2">
          {!collapsed && (
            <button
              onClick={() => setProfileOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 hover:bg-white/10 transition-colors duration-150 text-left"
            >
              <div className="h-8 w-8 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-bold flex-shrink-0">
                {userName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-heading truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-heading/50 truncate">{userRole}</p>
              </div>
            </button>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-950/20 transition"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <ProfileModal isOpen={profileOpen} onClose={closeProfile} />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
