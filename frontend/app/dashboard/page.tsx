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

      // Try to read role from Supabase profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      let role = profile?.role;

      // Sync to backend — this creates the user in the mock DB if missing
      // and returns the authoritative role + JWT
      try {
        const syncRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/supabase-sync`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: profile?.full_name || session.user.email,
              role: role || "CLIENT",
            }),
          },
        );
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          localStorage.setItem("token", syncData.token);
          // Use the backend's authoritative role
          role = syncData.user.role;
        } else {
          console.warn("Backend sync failed, API calls may not work");
        }
      } catch {
        console.warn("Backend sync failed, API calls may not work");
      }

      role = role || "CLIENT";
      setUserRole(role);

      const userInfo = {
        name: profile?.full_name || session.user.email,
        email: session.user.email,
        role,
      };

      localStorage.setItem("user", JSON.stringify(userInfo));

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
