'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Building2, Droplet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const industries = [
  {
    id: 'septic',
    name: 'Septic and Drain',
    description: 'High-frequency service calls. We intercept missed quotes, emergency drains, and septic pump-outs, locking in bookings immediately.',
    icon: Droplet,
    metrics: ['91.4% average call recovery', 'ServiceTitan sync ready'],
    tag: 'Septic Script Ready',
  },
  {
    id: 'industrial',
    name: 'Industrial Cleaning',
    description: 'Deep contract relationships. Reactivate legacy commercial accounts, hydro-blasting contracts, and tank cleanout lead lists.',
    icon: Building2,
    metrics: ['12.3% average lead reactivation', 'Voice AI and SMS multi-touch'],
    tag: 'Enterprise Template',
  },
  {
    id: 'laundry',
    name: 'Commercial Laundry',
    description: 'Route density and client retention. Revive cold hospitality, healthcare, and industrial laundry accounts with dedicated campaigns.',
    icon: Shield,
    metrics: ['8.7% reactivation match rate', '48-hour campaign turnaround'],
    tag: 'Commercial Template',
  },
];

export default function IndustriesSection() {
  return (
    <section id="industries" className="scroll-mt-28 space-y-16">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-gold">Industries</p>
        <h2 className="text-3xl font-semibold text-heading md:text-4xl lg:text-5xl">
          Purpose-built for your niche.
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/60">
          Pre-configured industry setups tuned specifically for operators in 
          septic, industrial cleaning, and commercial laundry.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {industries.map((ind, idx) => (
          <motion.article
            key={ind.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative rounded-2xl border border-white/[0.06] bg-surface p-8 transition-all duration-300 hover:border-white/[0.12]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-xl bg-gold/[0.08] p-3">
                <ind.icon className="h-5 w-5 text-gold" />
              </div>
              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                {ind.tag}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-heading">
              {ind.name}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              {ind.description}
            </p>

            <ul className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
              {ind.metrics.map((m) => (
                <li key={m} className="flex items-center gap-3 text-sm text-foreground/50">
                  <span className="h-1 w-1 rounded-full bg-gold/60" />
                  {m}
                </li>
              ))}
            </ul>

            <Link
              href="#contact"
              className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm font-medium text-foreground/60 transition-all duration-300 hover:border-white/[0.12] hover:text-foreground"
            >
              Run a live audit
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
