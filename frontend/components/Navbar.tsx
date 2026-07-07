"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "AI Assistant", href: "/assistant" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/superadmin")
  ) {
    return null;
  }

  const [session, setSession] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const supabaseSession = localStorage.getItem("supabase_session");
      const userStr = localStorage.getItem("user");
      setIsLoggedIn(!!token || !!supabaseSession);

      if ((token || supabaseSession) && userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = user.role?.toUpperCase?.() || user.role;
          setUserRole(role);
        } catch {
          // ignore
        }
      } else {
        setUserRole(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const sectionRoutes: Record<string, string> = {
      "/services": "services",
      "/pricing": "pricing",
      "/assistant": "assistant",
    };
    if (href === "/") {
      if (typeof window !== "undefined" && pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (href in sectionRoutes) {
      if (typeof window !== "undefined" && pathname === href) {
        e.preventDefault();
        const id = sectionRoutes[href];
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const effectiveLoggedIn = isLoggedIn || !!session;

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("supabase_session");
    setIsLoggedIn(false);
    setUserRole(null);
    setMobileOpen(false);

    if (session) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    window.location.href = "/";
  };

  let dashboardLink = null;
  let profileLink = null;
  if (effectiveLoggedIn) {
    profileLink = { label: "Profile", href: "/profile" };
    if (userRole === "SUPERADMIN") {
      dashboardLink = { label: "Superadmin Panel", href: "/dashboard" };
    } else if (userRole === "ADMIN") {
      dashboardLink = { label: "Admin Panel", href: "/dashboard" };
    } else if (userRole === "USER") {
      dashboardLink = { label: "User Dashboard", href: "/dashboard" };
    } else {
      dashboardLink = { label: "Command Center", href: "/dashboard" };
    }
  }

  const allNavItems = [...navItems, ...(profileLink ? [profileLink] : [])];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-2xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <div className="flex items-center gap-0">
            <Link
              href="/"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (
                  typeof window !== "undefined" &&
                  window.location.pathname === "/"
                ) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-3"
            >
              <Image
                src="/digilogo.png"
                alt="Digihood Studio"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span className="hidden sm:inline-flex flex-col leading-tight">
                <span className="text-[10px] text-foreground/40 tracking-[0.2em] uppercase">Portal by</span>
                <span className="font-monument text-sm tracking-[0.14em] text-heading">
                  DIGIHOOD<span className="text-[0.6em] text-foreground/40 ml-1">STUDIO</span>
                </span>
              </span>
            </Link>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center rounded-lg p-1.5 text-foreground/40 transition hover:text-foreground md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, item.href)}
                className="text-sm text-foreground/60 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {effectiveLoggedIn ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  {session?.user?.user_metadata?.avatar_url && (
                    <Image
                      src={session.user.user_metadata.avatar_url}
                      alt={session.user.user_metadata.full_name ?? "User"}
                      width={32}
                      height={32}
                      className="rounded-full border border-gold/20"
                    />
                  )}
                  {dashboardLink && (
                    <Link
                      href={dashboardLink.href}
                      className="inline-flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/[0.06] px-4 py-2 text-sm font-medium text-gold transition-all duration-300 hover:bg-gold/[0.1]"
                    >
                      <LayoutDashboard size={14} />
                      {dashboardLink.label}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground/60 transition-all duration-300 hover:bg-white/[0.08] hover:text-foreground"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="md:hidden rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-foreground/60 transition hover:bg-white/[0.08] hover:text-foreground"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hidden md:inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-2 text-foreground/60 transition hover:bg-white/[0.08] hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {mounted && theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <Link
                  href="/login"
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background transition-all duration-300 hover:brightness-110"
                >
                  Portal Login
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-3 right-3 top-[73px] z-40 rounded-xl border border-white/10 bg-background/98 backdrop-blur-2xl shadow-lg md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-0.5 p-2">
              {allNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    setMobileOpen(false);
                    handleNavClick(e, item.href);
                  }}
                  className="rounded-lg px-4 py-3 text-sm text-foreground/60 transition hover:bg-white/[0.04] hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
