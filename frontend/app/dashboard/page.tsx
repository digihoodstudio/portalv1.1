"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuperAdminDashboard from "../../components/SuperAdminDashboard";
import AdminDashboard from "../../components/AdminDashboard";
import ClientDashboard from "../../components/ClientDashboard";
import AgentDashboard from "../../components/AgentDashboard";

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("CLIENT");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    let role = "CLIENT";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        role = (u.role || "CLIENT").toUpperCase();
        if (!localStorage.getItem("token")) {
          localStorage.setItem("token", token);
        }
      } catch {}
    }

    setUserRole(role);
    setLoading(false);
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
