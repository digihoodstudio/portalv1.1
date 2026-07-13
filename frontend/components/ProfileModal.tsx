"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Briefcase,
  RefreshCw,
  Key,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  business: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [role, setRole] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          onClose();
          return;
        }

        const data = await response.json();
        if (response.ok && data.user) {
          const u = data.user as UserProfile;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setBusiness(u.business || "");
          setRole(u.role || "");
        } else {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const u = JSON.parse(userStr);
            setName(u.name || "");
            setEmail(u.email || "");
            setPhone(u.phone || "");
            setBusiness(u.business || "");
            setRole(u.role || "");
          }
        }
      } catch {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setBusiness(u.business || "");
          setRole(u.role || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          business,
          ...(password ? { password } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update profile");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMsg("Profile details successfully updated!");
      setPassword("");
      setConfirmPassword("");
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during updating");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-heading/40 hover:text-heading z-10"
            >
              <X size={18} />
            </button>

            {loading ? (
              <div className="py-20 text-center">
                <p className="animate-pulse text-sm text-heading/60">
                  Loading profile...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-heading">
                    Profile Settings
                  </h2>
                  <p className="text-xs text-heading/50 mt-1">
                    Configure your personal information and credentials.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col items-center text-center space-y-4 h-fit">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <User className="h-7 w-7" />
                      <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-surface" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-heading">
                        {name || "User"}
                      </h3>
                      <p className="text-[10px] text-heading/50">{email}</p>
                    </div>
                    <div className="w-full border-t border-white/10 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-heading/40">
                          <Shield size={12} /> Role
                        </span>
                        <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 font-semibold text-purple-300 text-[10px]">
                          {role}
                        </span>
                      </div>
                      {business && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-heading/40">
                            <Briefcase size={12} /> Business
                          </span>
                          <span className="font-semibold text-heading/80 text-[10px]">
                            {business}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-heading/40">
                          <CheckCircle size={12} /> Status
                        </span>
                        <span className="rounded-full bg-green-950/20 border border-green-500/25 px-2 py-0.5 font-semibold text-green-400 text-[10px]">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <AnimatePresence mode="wait">
                      {errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300"
                        >
                          <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
                          <span>{errorMsg}</span>
                        </motion.div>
                      )}
                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-300"
                        >
                          <CheckCircle size={14} className="flex-shrink-0 text-emerald-400" />
                          <span>{successMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                          Account Details
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition">
                            <span className="absolute inset-y-0 left-3 flex items-center text-heading/40">
                              <User size={13} />
                            </span>
                            <input
                              required
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Full name"
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs text-heading placeholder-white/30 outline-none"
                            />
                          </div>
                          <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition">
                            <span className="absolute inset-y-0 left-3 flex items-center text-heading/40">
                              <Mail size={13} />
                            </span>
                            <input
                              required
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email address"
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs text-heading placeholder-white/30 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                          Client & Business info
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition">
                            <span className="absolute inset-y-0 left-3 flex items-center text-heading/40">
                              <Building size={13} />
                            </span>
                            <input
                              type="text"
                              value={business}
                              onChange={(e) => setBusiness(e.target.value)}
                              placeholder="Company name"
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs text-heading placeholder-white/30 outline-none"
                            />
                          </div>
                          <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition">
                            <span className="absolute inset-y-0 left-3 flex items-center text-heading/40">
                              <Phone size={13} />
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Phone number"
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs text-heading placeholder-white/30 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Key size={12} /> Password (leave blank to keep current)
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition">
                            <span className="absolute inset-y-0 left-3 flex items-center text-heading/40">
                              <Lock size={13} />
                            </span>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="New password"
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs text-heading placeholder-white/30 outline-none"
                            />
                          </div>
                          <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition">
                            <span className="absolute inset-y-0 left-3 flex items-center text-heading/40">
                              <Lock size={13} />
                            </span>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm password"
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs text-heading placeholder-white/30 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-white/5">
                        <button
                          type="submit"
                          disabled={updating}
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-500 hover:bg-purple-600 px-5 py-2.5 text-xs font-bold text-heading transition disabled:opacity-50"
                        >
                          {updating ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
