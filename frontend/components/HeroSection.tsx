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
    <section id="home" className="relative pt-8 md:pt-14">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="flex flex-col items-center gap-10 md:gap-14">
            <div className="relative flex items-center justify-center w-40 h-40 md:w-56 md:h-56 animate-spin-slow">
              {/* Orbit ring */}
              <div className="absolute inset-0 rounded-full border border-white/15" />
              <div className="absolute inset-4 rounded-full border border-dashed border-white/8" />

              {/* Center dot */}
              <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-gold/60 shadow-[0_0_12px_rgba(180,144,98,0.3)]" />

              {/* Phone - top */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-background border border-white/10 shadow-lg z-20">
                <PhoneCall size={16} className="text-gold md:w-5 md:h-5" />
              </div>

              {/* Refresh - bottom-right */}
              <div className="absolute left-[82%] top-[82%] -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-background border border-white/10 shadow-lg z-20">
                <RefreshCw size={16} className="text-gold md:w-5 md:h-5" />
              </div>

              {/* Chart - bottom-left */}
              <div className="absolute left-[18%] top-[82%] -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-background border border-white/10 shadow-lg z-20">
                <BarChart3 size={16} className="text-gold md:w-5 md:h-5" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-heading sm:text-5xl md:text-6xl lg:text-7xl">
              Your AI Workforce{' '}
              <span className="text-gold">Never Sleeps.</span>
            </h1>
          </div>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            AI-powered phone answering, missed call recovery, and lead reactivation for 
            service businesses. Turn every missed opportunity into booked revenue — 24/7.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
          className="mt-8 flex flex-wrap items-center justify-center gap-6"
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
