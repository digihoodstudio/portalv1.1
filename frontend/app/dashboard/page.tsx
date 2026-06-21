"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SuperAdminDashboard from "../../components/SuperAdminDashboard";
import AdminDashboard from "../../components/AdminDashboard";
import ClientDashboard from "../../components/ClientDashboard";
import AgentDashboard from "../../components/AgentDashboard";

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("CLIENT");

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const role = profile?.role || "CLIENT";
      setUserRole(role);

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: profile?.full_name || session.user.email,
          email: session.user.email,
          role,
        }),
      );

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const isStaffRole = (role: string) =>
    ["AGENT", "TEAMLEADER", "EMPLOYEE", "ADMIN"].includes(role?.toUpperCase());
  const isAdminRole = (role: string) => role?.toUpperCase() === "SUPERADMIN";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <p className="animate-pulse text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {isAdminRole(userRole) && <SuperAdminDashboard />}
      {isStaffRole(userRole) && <AdminDashboard />}
      {!isAdminRole(userRole) && !isStaffRole(userRole) && <ClientDashboard />}
    </>
  );
}
