'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PhoneIncoming, Send, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const pillars = [
  {
    id: 'convert',
    title: 'Convert',
    subtitle: 'Always-On Inbound AI',
    description: 'Intercept missed calls, texts, and website chats instantly. Our conversational voice AI answers in under 10 seconds, qualifies inquiries, and books jobs directly into your dispatch schedule.',
    icon: PhoneIncoming,
    features: [
      'Answers missed calls in 10 seconds',
      'Intelligent dispatch and booking',
      'Seamless voice and SMS handoff',
    ],
  },
  {
    id: 'nurture',
    title: 'Nurture',
    subtitle: 'Outbound Lead Reactivation',
    description: 'Fill your dispatch board during slow periods with multi-touch reactivation campaigns across voice and text messaging to re-engage cold leads, old quotes, and past customers.',
    icon: Send,
    features: [
      'CSV list drag-and-drop launcher',
      'Multi-channel SMS and call flows',
      'Custom templates for trade niches',
    ],
  },
  {
    id: 'track',
    title: 'Track',
    subtitle: 'Real-Time Command Center',
    description: 'Score every lead interaction and call transcript in one central dashboard. Track recovered revenue, replay voice recordings, and sync with ServiceTitan and HubSpot.',
    icon: Activity,
    features: [
      'Playable client call library',
      'Dynamic revenue counter',
      'ServiceTitan and HubSpot auto-sync',
    ],
  },
];

export default function ValuePillars() {
  return (
    <section id="features" className="scroll-mt-28 space-y-16">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-gold">How It Works</p>
        <h2 className="text-3xl font-semibold text-heading md:text-4xl lg:text-5xl">
          Capture, revive, and scale revenue.
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/60">
          Voice receptionists, text-based drip sequences, and full transparency 
          logs — all working together to make your operations frictionless.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar, idx) => (
          <motion.article
            key={pillar.id}
            className="group relative rounded-2xl border border-white/[0.06] bg-surface p-8 transition-all duration-300 hover:border-white/[0.12]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-xl bg-gold/[0.08] p-3">
                <pillar.icon className="h-5 w-5 text-gold" />
              </div>
              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                {pillar.subtitle}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-heading">
              {pillar.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              {pillar.description}
            </p>

            <ul className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
              {pillar.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-foreground/50">
                  <span className="h-1 w-1 rounded-full bg-gold/60" />
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href="#contact"
              className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm font-medium text-foreground/60 transition-all duration-300 hover:border-white/[0.12] hover:text-foreground"
            >
              Learn more
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
