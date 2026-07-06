import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    title: "Starter",
    description:
      "AI receptionist with appointment booking, scripts, and reports.",
    service: "AI Receptionist & Appointment Setter",
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
    service: "Missed Call Recovery",
    features: [
      "Everything in Starter",
      "Missed call recovery",
      "SMS follow-ups in 10s",
      "CRM integration",
      "Bi-weekly strategy call",
    ],
    highlight: true,
  },
  {
    title: "Dominance",
    description:
      "Unlimited contacts, full funnel automation, and brand-trained AI.",
    service: "Dead Lead Reactivation",
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
    <section
      id="pricing"
      className="scroll-mt-28 rounded-[20px] border border-white/[0.06] bg-surface p-6 md:p-12"
    >
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Pricing</p>
        <h2 className="mt-3 text-2xl font-semibold text-heading md:text-4xl">
          Plans for aggressive enterprise growth.
        </h2>
        <p className="mt-4 mx-auto max-w-xl text-foreground/80">
          Pick the right package for your team and scale with AI-powered
          workflows, voice agents, and automated revenue recovery.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.title}
            className={`relative flex h-full flex-col rounded-[20px] border transition ${
              tier.highlight
                ? "border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent"
                : "border-white/[0.06] bg-surface"
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-background z-20">
                Most Popular
              </div>
            )}

            <div className="flex h-full flex-col p-6">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.15em] text-gold">
                  {tier.service}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-heading">
                  {tier.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2.5 text-sm text-foreground/80"
                  >
                    <Check className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`block rounded-full py-3 text-center text-sm font-semibold transition ${
                  tier.highlight
                    ? "bg-gold text-background hover:brightness-95"
                    : "border border-white/[0.06] bg-white/[0.04] text-foreground hover:bg-white/[0.08]"
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
