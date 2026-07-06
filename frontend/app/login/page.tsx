"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setStatus("Registration successful! Please sign in with your credentials.");
    }
    if (searchParams.get("error") === "auth_failed") {
      setErrorMsg("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, [router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    setStatus("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setErrorMsg("");

    try {
      setStatus("Signing in...");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Backend unavailable. Please check your connection.");
      }

      if (!res.ok) {
        const msg = data.detail ? `${data.error} (${data.detail})` : data.error;
        throw new Error(msg || "Invalid credentials");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setStatus("Access Granted! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 pt-24 pb-6 md:px-6 font-sans">
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-[400px] w-[600px] rounded-full bg-gold/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] rounded-[24px] border border-white/10 bg-background/80 p-6 shadow-glow text-heading backdrop-blur-md"
      >
        <div className="mx-auto flex w-full items-center justify-center mb-3">
          <Image src="/digilogo.png" alt="Digihood Studio" width={48} height={48} className="rounded-full object-cover" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-heading">Welcome Back</h1>
          <p className="mt-0.5 text-xs text-heading/50">Sign in to your portal</p>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3.5 text-xs text-red-300 font-medium"
            >
              <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {status && (
            <motion.div
              key="status"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 rounded-xl border border-gold/20 bg-gold/5 p-3.5 text-xs text-gold font-semibold"
            >
              {status}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-heading hover:bg-white/10 transition disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-heading/30">or continue with</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="text-[10px] font-bold text-heading/50 tracking-widest uppercase block mb-2">
              Email Address
            </label>
            <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-gold/50 transition">
              <span className="absolute inset-y-0 left-4 flex items-center text-heading/40">
                <Mail size={14} />
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-transparent py-2.5 pl-11 pr-4 text-xs text-heading placeholder-white/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-heading/50 tracking-widest uppercase block mb-2">
              Password
            </label>
            <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-gold/50 transition">
              <span className="absolute inset-y-0 left-4 flex items-center text-heading/40">
                <Lock size={14} />
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent py-2.5 pl-11 pr-4 text-xs text-heading placeholder-white/30 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl
                       bg-gold hover:brightness-110 py-3 text-xs font-bold
                       text-background transition duration-200 shadow-md shadow-gold/10
                       hover:scale-[1.01] disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-4 border-t border-white/5 pt-4 text-center">
          <p className="text-xs text-heading/50">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-gold hover:text-heading transition-all">
              Sign Up / Register
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="relative flex min-h-screen items-center justify-center px-4 py-4 md:px-6 font-sans text-heading">
        <div className="text-center"><p className="animate-pulse text-xs text-heading/50">Initializing login forms...</p></div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
