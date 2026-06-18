'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PhoneIncoming, Send, Activity, ArrowRight } from 'lucide-react';

const pillars = [
  {
    id: 'convert',
    title: 'Convert',
    subtitle: 'Always-On Inbound AI',
    description: 'Intercept missed calls, texts, and website chats instantly. Our conversational voice AI answers in under 10 seconds, qualifies inquiries, and books jobs directly into your dispatch schedule 24/7.',
    icon: <PhoneIncoming className="h-6 w-6 text-gold" />,
    features: [
      'Answers missed calls in 10s',
      'Intelligent dispatch & booking',
      'Seamless voice & SMS handoff',
      'No more after-hours call center vendors'
    ],
    cta: 'Learn Inbound System'
  },
  {
    id: 'nurture',
    title: 'Nurture',
    subtitle: 'Outbound Lead Reactivation',
    description: 'Fill your dispatch board during slow periods. We launch multi-touch reactivation campaigns across voice and text messaging to re-engage cold leads, old quotes, and past customers.',
    icon: <Send className="h-6 w-6 text-gold" />,
    features: [
      'CSV list drag-and-drop launcher',
      'Multi-channel SMS + Call flows',
      'Custom templates for trade niches',
      'Automatic conversation takeover options'
    ],
    cta: 'Explore Campaigns'
  },
  {
    id: 'track',
    title: 'Track',
    subtitle: 'Real-Time Command Center',
    description: 'Score every lead interaction and call transcript in one central dashboard. Track recovered revenue statistics, replay voice recordings, and sync data directly with ServiceTitan and HubSpot CRM.',
    icon: <Activity className="h-6 w-6 text-gold" />,
    features: [
      'Playable client Call Library',
      'Dynamic revenue counter running totals',
      'ServiceTitan & HubSpot auto-sync',
      'Direct agent hotline assistance support'
    ],
    cta: 'Preview Command Center'
  }
];

export default function ValuePillars() {
  return (
    <section id="features" className="scroll-mt-28 space-y-12">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold font-bold">Operational Framework</p>
        <h2 className="text-3xl font-semibold text-white md:text-5xl">Capture, Revive, and Scale Revenue.</h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-foreground/80">
          We combine voice receptionists, text-based drip sequences, and read-only transparency logs to make client operations frictionless.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar, idx) => (
          <motion.article
            key={pillar.id}
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
                  {pillar.icon}
                </div>
                <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[9px] text-white/50 font-semibold uppercase tracking-wider">
                  {pillar.subtitle}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-gold transition duration-300">
                {pillar.title}
              </h3>

              <p className="mt-4 text-xs text-foreground/80 leading-relaxed min-h-[72px]">
                {pillar.description}
              </p>

              {/* Bullet Features */}
              <ul className="mt-6 space-y-2 border-t border-white/5 pt-4">
                {pillar.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2 text-[11px] text-white/60">
                    <span className="h-1 w-1 rounded-full bg-gold/70" />
                    <span>{feat}</span>
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
                <span>{pillar.cta}</span>
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
