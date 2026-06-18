'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';

const industryParams: Record<string, { name: string; closeRate: number; jobValue: number }> = {
  septic: {
    name: 'Septic & Drain',
    closeRate: 0.85,
    jobValue: 650
  },
  industrial: {
    name: 'Industrial Cleaning',
    closeRate: 0.35,
    jobValue: 8500
  },
  laundry: {
    name: 'Commercial Laundry',
    closeRate: 0.60,
    jobValue: 3500
  }
};

export default function RoiCalculator() {
  const [missedCalls, setMissedCalls] = useState(50);
  const [selectedIndustry, setSelectedIndustry] = useState('septic');

  const stats = useMemo(() => {
    const param = industryParams[selectedIndustry];
    const recoveredCalls = Math.round(missedCalls * param.closeRate);
    const recoveredRevenue = recoveredCalls * param.jobValue;
    const planFee = 2997; // Growth plan price
    const roiMultiple = (recoveredRevenue / planFee).toFixed(1);

    return {
      recoveredCalls,
      recoveredRevenue,
      roiMultiple
    };
  }, [missedCalls, selectedIndustry]);

  return (
    <section id="roi-calculator" className="scroll-mt-28 rounded-[32px] border border-white/10 bg-glass p-8 shadow-glow md:p-12">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        
        {/* Left: Slider Controls */}
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold font-bold">ROI Calculator</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-4xl">
              Calculate your lost opportunity cost.
            </h2>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
              Operator calls go unanswered every day. Slide to configure your monthly missed calls, select your trade niche, and view estimated recovered revenue.
            </p>
          </div>

          {/* Industry Selection */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Select Industry Niche</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(industryParams).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedIndustry(key)}
                  className={`rounded-2xl border px-3 py-3.5 text-xs font-semibold tracking-wide transition-all ${
                    selectedIndustry === key
                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(207,199,186,0.15)]'
                      : 'border-white/10 bg-[#061022]/40 text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {data.name}
                </button>
              ))}
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-4 rounded-2xl bg-white/5 border border-white/5 p-6">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Monthly Missed Calls</span>
              <span className="text-2xl font-extrabold text-gold">{missedCalls}</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={missedCalls}
              onChange={(e) => setMissedCalls(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>10 calls</span>
              <span>150 calls</span>
              <span>300 calls</span>
            </div>
          </div>
        </div>

        {/* Right: Calculations Widget */}
        <div className="rounded-[28px] border border-gold/20 bg-gradient-to-b from-gold/5 to-transparent p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-gold/10 pointer-events-none">
            <TrendingUp className="h-32 w-32" />
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Estimated Monthly Value</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">Recovered Revenue</h3>
            </div>

            {/* Main recovered sum */}
            <div className="flex items-baseline gap-1 text-white">
              <DollarSign className="h-8 w-8 text-gold flex-shrink-0 self-center" />
              <motion.span
                key={stats.recoveredRevenue}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-extrabold tracking-tight"
              >
                {stats.recoveredRevenue.toLocaleString()}
              </motion.span>
              <span className="text-xs text-white/40 ml-2 font-mono">/ month</span>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 mt-2">
              <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Recovered Bookings</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.recoveredCalls}</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Plan ROI Multiple</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.roiMultiple}x</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 text-2xs text-emerald-400 leading-normal">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Based on a {Math.round(industryParams[selectedIndustry].closeRate * 100)}% closing conversion and ${industryParams[selectedIndustry].jobValue} average ticket.</span>
            </div>
          </div>

          <a
            href="#contact"
            className="w-full inline-flex items-center justify-center rounded-full bg-gold py-4 text-sm font-semibold text-background transition hover:brightness-105 hover:shadow-[0_0_24px_rgba(207,199,186,0.35)] hover:scale-[1.01] relative z-10"
          >
            Request a Performance Preview
          </a>
        </div>
      </div>
    </section>
  );
}
