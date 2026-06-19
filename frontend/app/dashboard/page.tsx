"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SuperAdminDashboard from "../../components/SuperAdminDashboard";
import AdminDashboard from "../../components/AdminDashboard";
import ClientDashboard from "../../components/ClientDashboard";
import AgentDashboard from "../../components/AgentDashboard";
import { getCleanDisplayName } from "../../utils/nameHelper";

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    name?: string;
    role?: string;
    email?: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<string>("CLIENT");

  const fetchDashboardData = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Get profile from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser({
        name: profile?.full_name || session.user.email,
        email: session.user.email,
        role: profile?.role || "CLIENT",
      });
      setUserRole(profile?.role || "CLIENT");
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const getDisplayName = () => {
    return getCleanDisplayName(user?.name, user?.email);
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toUpperCase()) {
      case "SUPERADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Company Admin";
      case "TEAMLEADER":
        return "Team Leader";
      case "AGENT":
        return "Outbound Agent";
      case "EMPLOYEE":
        return "Employee";
      case "CLIENT":
        return "Client Portal";
      case "USER":
        return "Client Portal";
      default:
        return role
          ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
          : "User";
    }
  };

  const isStaffRole = (role: string) =>
    ["AGENT", "TEAMLEADER", "EMPLOYEE", "ADMIN"].includes(role?.toUpperCase());
  const isAdminRole = (role: string) => role?.toUpperCase() === "SUPERADMIN";

  if (loading) {
    return (
      <main className="mx-auto mt-32 max-w-xl px-6 pb-24 text-center text-white">
        <div className="rounded-[32px] border border-white/10 bg-glass p-10 shadow-glow">
          <p className="animate-pulse text-sm text-white/60">
            Launching unified systems control console...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-28 max-w-7xl px-6 pb-24 md:px-12 font-sans text-white">
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
        <div
          className={`h-[350px] w-[600px] rounded-full blur-[140px] opacity-15 transition-colors duration-500 ${
            isAdminRole(userRole)
              ? "bg-purple-600"
              : isStaffRole(userRole)
                ? "bg-amber-600"
                : "bg-blue-600"
          }`}
        />
      </div>

      <div className="rounded-[32px] border border-white/10 bg-glass p-6 md:p-10 shadow-glow space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full animate-ping ${
                  isAdminRole(userRole)
                    ? "bg-purple-500"
                    : isStaffRole(userRole)
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">
                {isAdminRole(userRole)
                  ? "Enterprise System Cockpit"
                  : isStaffRole(userRole)
                    ? "Staff Workspace"
                    : "Client Workspace Command Center"}
              </p>
            </div>

            <h1 className="text-2xl font-extrabold md:text-3xl bg-gradient-to-r from-white via-white to-gold bg-clip-text text-transparent">
              Welcome Back, {getDisplayName()}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span
                className={`rounded-full border px-3 py-1 text-2xs font-bold ${
                  isAdminRole(userRole)
                    ? "bg-purple-950/40 border-purple-500/35 text-purple-300"
                    : isStaffRole(userRole)
                      ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                      : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {getRoleLabel(userRole)}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-2xs text-emerald-400 font-semibold">
                SYSTEMS LIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:self-start lg:self-center">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:text-gold"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/20 px-5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950/40"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="transition-opacity duration-300">
          {userRole === "SUPERADMIN" && <SuperAdminDashboard />}
          {isStaffRole(userRole) && <AgentDashboard />}
          {!isAdminRole(userRole) && !isStaffRole(userRole) && (
            <ClientDashboard />
          )}
        </div>
      </div>
    </main>
  );
}
