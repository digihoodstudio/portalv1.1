"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Phone,
  Upload,
  StickyNote,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Calendar,
  RefreshCw,
  Shield,
} from "lucide-react";

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
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Company Admin");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name || session?.user?.name || "Admin");
        const r = (u.role || "").toUpperCase();
        if (r === "SUPERADMIN") setUserRole("Super Admin");
        else if (r === "ADMIN") setUserRole("Company Admin");
        else if (r === "AGENT") setUserRole("Outbound Agent");
        else if (r === "TEAMLEADER") setUserRole("Team Leader");
        else if (r === "EMPLOYEE") setUserRole("Employee");
        else setUserRole("Client Portal");
      } catch {}
    } else if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session]);

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const supabase = createClient();
    await supabase.auth.signOut();
    if (session) signOut({ callbackUrl: "/" });
    else router.push("/login");
  };

  const refresh = () => window.location.reload();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Sidebar (sticky) ── */}
      <aside
        className={`${collapsed ? "w-20" : "w-64"} flex-shrink-0 border-r border-white/10 bg-[#06101f]/80 backdrop-blur-xl transition-all duration-300 flex flex-col sticky top-0 h-screen`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          {!collapsed && (
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                DIGIHOOD
              </span>
              <span className="text-xs font-semibold text-white">STUDIO</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
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
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full border border-gold/30 flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-white/50 truncate">{userRole}</p>
              </div>
            </div>
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

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Sticky welcome header */}
        <div className="sticky top-0 z-30 border-b border-white/10 bg-background/95 backdrop-blur-xl px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                Staff Workspace
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-white">
                Welcome Back, {userName}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/20 px-3 py-1 text-xs font-semibold text-orange-300">
                  <Shield size={11} /> {userRole}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SYSTEMS LIVE
                </span>
              </div>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
