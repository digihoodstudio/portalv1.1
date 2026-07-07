"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  MessageCircle,
  Mail,
  User,
  Phone,
  Briefcase,
} from "lucide-react";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);
        if (user.business) setBusiness(user.business);
      } catch (e) {
        console.error("Failed to parse user details", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          business,
          source: "Homepage Contact Form",
          clientId: "client-default",
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setBusiness("");
      setMessage("");
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    {
      name: "WhatsApp",
      value: "+977 9712039972",
      url: "https://wa.me/message/FKV26Z3XPSIOL1",
      icon: MessageCircle,
    },
    {
      name: "Email",
      value: "info@digihoodstudio.com",
      url: "mailto:info@digihoodstudio.com",
      icon: Mail,
    },
  ];

  return (
    <section id="contact" className="scroll-mt-28 space-y-16">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-gold">Contact</p>
        <h2 className="text-3xl font-semibold text-heading md:text-4xl lg:text-5xl">
          Let&apos;s scale your operations.
        </h2>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground/60">
          Get in touch with our team to design a custom voice or chat agent flow 
          for your business.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-surface p-8">
          <h3 className="text-lg font-semibold text-heading mb-6">
            Request a Consultation
          </h3>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center space-y-4"
              >
                <div className="rounded-full bg-emerald-500/10 p-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-heading">
                  Request Submitted
                </h4>
                <p className="text-sm text-foreground/60 max-w-sm">
                  Our team has received your details and will follow up shortly.
                </p>
                <button
                  onClick={() => setStatus("")}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-2 text-sm text-foreground/60 transition hover:bg-white/[0.08] hover:text-foreground"
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                autoComplete="off"
              >
                {status === "error" && (
                  <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-300">
                    Failed to submit. Please try again.
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-gold/40 transition">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-foreground/30">
                        <User size={15} />
                      </span>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-heading outline-none placeholder:text-foreground/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-gold/40 transition">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-foreground/30">
                        <Mail size={15} />
                      </span>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-heading outline-none placeholder:text-foreground/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-gold/40 transition">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-foreground/30">
                        <Phone size={15} />
                      </span>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-heading outline-none placeholder:text-foreground/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                      Business Name
                    </label>
                    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-gold/40 transition">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-foreground/30">
                        <Briefcase size={15} />
                      </span>
                      <input
                        required
                        type="text"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder="Enter your business name"
                        className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-heading outline-none placeholder:text-foreground/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                    Message
                  </label>
                  <div className="relative rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-gold/40 transition">
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your automation needs..."
                      className="w-full rounded-xl bg-transparent p-4 text-sm text-heading outline-none placeholder:text-foreground/20 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-medium text-background transition hover:brightness-105 disabled:opacity-60"
                >
                  <Send size={15} />
                  <span>{loading ? "Submitting..." : "Send Request"}</span>
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          {channels.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-surface p-6 transition-all duration-300 hover:border-white/[0.12]"
            >
              <div className="rounded-xl border border-white/[0.06] bg-gold/[0.06] p-3">
                <channel.icon className="h-5 w-5 text-gold" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-heading">
                    {channel.name}
                  </h4>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400 uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <p className="text-sm text-foreground/60">
                  {channel.value}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
