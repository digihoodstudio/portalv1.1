import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    title: "Starter",
    description:
      "AI receptionist with appointment booking, scripts, and weekly reports.",
    features: [
      "24/7 AI call answering",
      "Custom call scripts",
      "Appointment booking",
      "Weekly reports",
      "Email support",
    ],
    highlight: false,
  },
  {
    title: "Growth",
    description:
      "Adds follow-up automation, CRM integration, and strategy calls.",
    features: [
      "Everything in Starter",
      "Missed call recovery",
      "SMS follow-ups in 10 seconds",
      "CRM integration",
      "Bi-weekly strategy call",
    ],
    highlight: true,
  },
  {
    title: "Dominance",
    description:
      "Unlimited contacts, full funnel automation, and brand-trained AI.",
    features: [
      "Everything in Growth",
      "Dead lead reactivation",
      "Unlimited contacts",
      "Brand-trained AI voice",
      "Dedicated success manager",
    ],
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-28 space-y-16">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-gold">Pricing</p>
        <h2 className="text-3xl font-semibold text-heading md:text-4xl lg:text-5xl">
          Plans for aggressive growth.
        </h2>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground/60">
          Pick the right package for your team and scale with AI-powered 
          workflows, voice agents, and automated revenue recovery.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.title}
            className={`relative flex flex-col rounded-2xl border p-8 transition ${
              tier.highlight
                ? "border-gold/30 bg-gradient-to-b from-gold/[0.04] to-transparent"
                : "border-white/[0.06] bg-surface"
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-background">
                Most Popular
              </div>
            )}

            <div className="flex h-full flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-heading">
                  {tier.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {tier.description}
                </p>
              </div>

              <ul className="flex-1 space-y-3">
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-3 text-sm text-foreground/60"
                  >
                    <Check className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-medium transition ${
                  tier.highlight
                    ? "bg-gold text-background hover:brightness-95"
                    : "border border-white/[0.06] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.06] hover:text-foreground"
                }`}
              >
                Book a Demo
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
