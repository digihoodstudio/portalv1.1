"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const industryParams: Record<
  string,
  { name: string; closeRate: number; jobValue: number }
> = {
  septic: {
    name: "Septic and Drain",
    closeRate: 0.85,
    jobValue: 650,
  },
  industrial: {
    name: "Industrial Cleaning",
    closeRate: 0.35,
    jobValue: 8500,
  },
  laundry: {
    name: "Commercial Laundry",
    closeRate: 0.6,
    jobValue: 3500,
  },
};

export default function RoiCalculator() {
  const [missedCalls, setMissedCalls] = useState(50);
  const [selectedIndustry, setSelectedIndustry] = useState("septic");

  const stats = useMemo(() => {
    const param = industryParams[selectedIndustry];
    const recoveredCalls = Math.round(missedCalls * param.closeRate);
    const recoveredRevenue = recoveredCalls * param.jobValue;
    const planFee = 2997;
    const roiMultiple = (recoveredRevenue / planFee).toFixed(1);

    return {
      recoveredCalls,
      recoveredRevenue,
      roiMultiple,
    };
  }, [missedCalls, selectedIndustry]);

  return (
    <section id="roi-calculator" className="scroll-mt-28 space-y-12">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-gold">ROI Calculator</p>
        <h2 className="text-3xl font-semibold text-heading md:text-4xl lg:text-5xl">
          Calculate your lost opportunity cost.
        </h2>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground/60">
          Slide to configure your monthly missed calls, select your trade niche, 
          and see estimated recovered revenue.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8 rounded-2xl border border-white/[0.06] bg-surface p-8">
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
              Industry
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(industryParams).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedIndustry(key)}
                  className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                    selectedIndustry === key
                      ? 'border-gold/30 bg-gold/[0.06] text-gold'
                      : 'border-white/[0.06] bg-white/[0.03] text-foreground/50 hover:border-white/20 hover:text-foreground'
                  }`}
                >
                  {data.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                Monthly Missed Calls
              </span>
              <span className="text-2xl font-bold text-gold">
                {missedCalls}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={missedCalls}
              onChange={(e) => setMissedCalls(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold focus:outline-none"
            />
            <div className="flex justify-between text-xs text-foreground/30">
              <span>10 calls</span>
              <span>150 calls</span>
              <span>300 calls</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/[0.04] to-transparent p-8">
          <div className="absolute top-0 right-0 p-4 text-gold/[0.06] pointer-events-none">
            <TrendingUp className="h-32 w-32" />
          </div>

          <div className="relative space-y-6">
            <div>
              <p className="text-xs font-medium text-gold uppercase tracking-wider">
                Estimated Monthly Value
              </p>
              <h3 className="text-2xl font-semibold text-heading mt-1">
                Recovered Revenue
              </h3>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-gold">NPR</span>
              <motion.span
                key={stats.recoveredRevenue}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold tracking-tight text-heading md:text-5xl"
              >
                {stats.recoveredRevenue.toLocaleString()}
              </motion.span>
              <span className="text-sm text-foreground/40">/ month</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                <p className="text-xs text-foreground/40 uppercase tracking-wider">
                  Bookings
                </p>
                <p className="text-2xl font-bold text-heading mt-1">
                  {stats.recoveredCalls}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                <p className="text-xs text-foreground/40 uppercase tracking-wider">
                  ROI Multiple
                </p>
                <p className="text-2xl font-bold text-gold mt-1">
                  {stats.roiMultiple}x
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              Based on a {Math.round(industryParams[selectedIndustry].closeRate * 100)}%
              closing rate and NPR {industryParams[selectedIndustry].jobValue.toLocaleString()} average ticket.
            </div>
          </div>

          <a
            href="#contact"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gold py-3.5 text-sm font-medium text-background transition hover:brightness-105"
          >
            Request a Performance Preview
          </a>
        </div>
      </div>
    </section>
  );
}
