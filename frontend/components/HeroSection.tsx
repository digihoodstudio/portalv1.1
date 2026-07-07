'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, ArrowRight, BarChart3, PhoneCall, RefreshCw } from 'lucide-react';

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <section id="home" className="relative">
      <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.04] px-4 py-1.5 text-xs font-medium text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Enterprise AI Automation Platform
            </div>

            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-heading sm:text-5xl md:text-6xl lg:text-7xl">
              Your AI Workforce{' '}
              <span className="text-gold">Never Sleeps.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              AI-powered phone answering, missed call recovery, and lead reactivation for 
              service businesses. Turn every missed opportunity into booked revenue — 24/7.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:brightness-110"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:brightness-110"
              >
                Book a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/watch-demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-gold/30 hover:text-gold"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center gap-6 pt-2"
          >
            {[
              { icon: PhoneCall, text: '24/7 AI Answering' },
              { icon: RefreshCw, text: 'Missed Call Recovery' },
              { icon: BarChart3, text: 'Real-Time Dashboard' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-xs text-foreground/50">
                <item.icon className="h-3.5 w-3.5 text-gold/70" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-gold/[0.03] to-transparent p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(180,144,98,0.08),transparent_60%)]" />
            
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-foreground/50">Platform Status</p>
                  <p className="text-sm font-semibold text-heading">All Systems Operational</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-medium text-emerald-400">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Calls', value: '18', change: '+12%' },
                  { label: 'Leads Today', value: '142', change: '+8%' },
                  { label: 'Revenue', value: 'NPR 24.8k', change: '+23%' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold text-heading">{stat.value}</p>
                    <p className="text-[10px] font-medium text-emerald-400">{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">Recent Activity</p>
                  <span className="text-[10px] text-gold">View all</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { msg: 'AI booked appointment — Sarah M.', time: '2m ago' },
                    { msg: 'Missed call recovered — +1 (555) 0134', time: '12m ago' },
                    { msg: 'Lead reactivated — James T.', time: '38m ago' },
                  ].map((item) => (
                    <div key={item.msg} className="flex items-center justify-between">
                      <p className="text-xs text-foreground/60">{item.msg}</p>
                      <span className="text-[10px] text-foreground/30">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-white/[0.06] pt-8 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/40"
      >
        <span>ServiceTitan Integration</span>
        <span className="h-3 w-px bg-white/[0.06]" />
        <span>24/7 AI Answering</span>
        <span className="h-3 w-px bg-white/[0.06]" />
        <span>Outbound Reactivation</span>
        <span className="h-3 w-px bg-white/[0.06]" />
        <span>Enterprise Secure</span>
      </motion.div>
    </section>
  );
}
