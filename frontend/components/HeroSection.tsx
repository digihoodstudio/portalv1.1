'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, Phone, TrendingUp, Users, PhoneIncoming, LayoutDashboard } from 'lucide-react';

const activityFeed = [
  { id: 1, msg: 'AI booked appointment — Sarah M.', time: 'just now', type: 'booking' },
  { id: 2, msg: 'Missed call recovered — +1 (555) 0134', time: '12s ago', type: 'recovery' },
  { id: 3, msg: 'Lead reactivated — James T.', time: '38s ago', type: 'lead' },
  { id: 4, msg: 'AI booked appointment — Chen L.', time: '1m ago', type: 'booking' },
];

const dotColors: Record<string, string> = {
  booking: 'bg-emerald-400',
  recovery: 'bg-blue-400',
  lead: 'bg-gold',
  call: 'bg-purple-400',
  revenue: 'bg-rose-400',
};

function WaveBar({ delay }: { delay: number }) {
  return (
    <div
      className="w-1 rounded-full bg-gold/70"
      style={{
        height: '6px',
        animation: `wave 1.4s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-surface p-6 md:p-12"
    >
      <div className="grid gap-12 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">

        {/* Left: Hero copy */}
        <div className="space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-3xl font-semibold leading-tight text-heading sm:text-5xl md:text-6xl"
          >
            Your AI Workforce{' '}
            <span className="text-gold">
              Never Sleeps.
            </span>
          </motion.h1>

          <div className="flex flex-col gap-4 sm:flex-row">
            {isLoggedIn ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:brightness-110">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/book-demo" className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:brightness-110">
                Book Demo
              </Link>
            )}
            <Link href="/watch-demo" className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-sm text-foreground transition-all duration-300 hover:border-gold/50 hover:text-gold">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Right: Live Dashboard */}
        <div className="relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-surface p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-heading/50">AI Control Center</p>
              <p className="mt-0.5 text-sm font-semibold text-heading">Live Performance Dashboard</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Active Calls', value: 18, icon: <Phone className="h-3.5 w-3.5" />, color: 'text-blue-400' },
              { label: 'Leads Today', value: 142, icon: <Users className="h-3.5 w-3.5" />, color: 'text-gold' },
              { label: 'Revenue', value: '24.8k', icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-3 py-3 text-center">
                <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1`}>
                  {stat.icon}
                  <span className="text-[10px] uppercase tracking-wider font-medium">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-heading">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Waveform */}
          <div className="mb-4 rounded-2xl border border-white/[0.06] dark:bg-[#040A1E] bg-surface-elevated px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-heading/40">Voice Agent — Live</p>
              <div className="flex items-center gap-1 text-[10px] text-gold">
                <PhoneIncoming className="h-3 w-3" />
                <span>Answering</span>
              </div>
            </div>
            <div className="flex h-8 items-end justify-between gap-0.5">
              {Array.from({ length: 28 }).map((_, i) => (
                <WaveBar key={i} delay={i * 0.05} />
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3">
            <p className="mb-2.5 text-[10px] uppercase tracking-[0.15em] text-heading/40">Activity Feed</p>
            <div className="space-y-2">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5"
                >
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColors[item.type] ?? 'bg-white/40'}`} />
                  <p className="flex-1 text-xs text-heading/75 leading-tight truncate">{item.msg}</p>
                  <span className="text-[10px] text-heading/30 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion bar */}
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-[10px]">
              <span className="uppercase tracking-wider text-heading/40">Conversion Rate</span>
              <span className="font-semibold text-gold">87.4%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[87.4%] rounded-full bg-gradient-to-r from-gold/60 to-gold" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-heading/30">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Trust badges */}
      <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center lg:justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-heading/45">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span>ServiceTitan Integration Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span>Always-On 24/7 AI Answering</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span>Outbound Reactivation Campaigns</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span>Enterprise Secure & GDPR Ready</span>
        </div>
      </div>
    </section>
  );
}
