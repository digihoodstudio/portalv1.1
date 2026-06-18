'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Building2, Droplet, ArrowRight } from 'lucide-react';

const industries = [
  {
    id: 'septic',
    name: 'Septic & Drain',
    revenue: '$5M–$15M',
    description: 'High-frequency service calls. We intercept missed quotes, emergency drains, and septic pump-outs, locking in bookings immediately.',
    icon: <Droplet className="h-6 w-6 text-gold" />,
    metrics: ['Average Call Recovery: 91.4%', 'Avg Job Value: $450 - $1,200', 'CRM: ServiceTitan Sync Ready'],
    badge: 'Septic Script Ready'
  },
  {
    id: 'industrial',
    name: 'Industrial Cleaning',
    revenue: '$8M–$40M',
    description: 'Deep contract relationships. We reactivate legacy commercial accounts, hydro-blasting contracts, and tank cleanout lead lists.',
    icon: <Building2 className="h-6 w-6 text-gold" />,
    metrics: ['Average Lead Reactivation: 12.3%', 'Avg Contract Value: $8,000+', 'Outreach: Voice AI + SMS Multi-Touch'],
    badge: 'Enterprise Niche Template'
  },
  {
    id: 'laundry',
    name: 'Commercial Laundry',
    revenue: '$5M–$25M',
    description: 'Route density and client retention. We revive cold hospitality, healthcare, and industrial laundry accounts with dedicated campaigns.',
    icon: <Shield className="h-6 w-6 text-gold" />,
    metrics: ['Reactivation Match: 8.7%', 'Avg Annual Account Value: $15,000+', 'Campaign Duration: 48h Live Turnaround'],
    badge: 'Commercial Niche Template'
  }
];

export default function IndustriesSection() {
  return (
    <section id="services" className="scroll-mt-28 space-y-12">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold font-bold">Niches We Serve</p>
        <h2 className="text-3xl font-semibold text-white md:text-5xl">Three Niche Doors. Stated Revenue Focus.</h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-foreground/80">
          We do not build generic chatbots. We deliver pre-configured industry setups tuned specifically for operators in Septic, Industrial, and Laundry brackets.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {industries.map((ind, idx) => (
          <motion.article
            key={ind.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="group flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-8 shadow-glow transition duration-300 hover:border-gold/30 hover:bg-white/8 hover:scale-[1.01]"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="rounded-xl bg-gold/10 p-3 mb-4 group-hover:bg-gold/25 transition">
                  {ind.icon}
                </div>
                <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                  {ind.badge}
                </span>
              </div>

              {/* Title & Revenue */}
              <h3 className="text-xl font-bold text-white mt-1 group-hover:text-gold transition duration-300">
                {ind.name}
              </h3>
              
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gold/5 border border-gold/15 px-2.5 py-1 text-xs text-gold font-bold">
                Target Revenue: {ind.revenue}
              </div>

              <p className="mt-4 text-xs text-foreground/80 leading-relaxed">
                {ind.description}
              </p>

              {/* Bullet Metrics */}
              <ul className="mt-6 space-y-2 border-t border-white/5 pt-4">
                {ind.metrics.map((m, mIdx) => (
                  <li key={mIdx} className="flex items-center gap-2 text-[11px] text-white/60">
                    <span className="h-1 w-1 rounded-full bg-gold/70" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA action */}
            <div className="mt-8 pt-4 border-t border-white/5">
              <a
                href="#contact"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-gold/30 hover:text-gold"
              >
                Run a Live Audit <ArrowRight className="h-3 w.5 transition group-hover:translate-x-1" />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
