import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-gold/[0.04] to-transparent p-10 text-center md:p-16">
      <h2 className="text-3xl font-semibold text-heading md:text-4xl">
        Ready to activate your AI workforce?
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-foreground/60">
        Book a personalized demo, activate a trained voice agent, and deliver 
        enterprise results with every first interaction.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-medium text-background transition hover:brightness-95"
        >
          Book Consultation
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-foreground/70 transition hover:border-white/20 hover:text-foreground"
        >
          Contact Sales
        </Link>
      </div>
    </section>
  );
}
