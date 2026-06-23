'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import ValuePillars from '@/components/ValuePillars';
import IndustriesSection from '@/components/IndustriesSection';
import AssistantPanel from '@/components/AssistantPanel';
import RoiCalculator from '@/components/RoiCalculator';
import PricingSection from '@/components/PricingSection';
import ContactSection from '@/components/ContactSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import FloatingOrbs from '@/components/FloatingOrbs';

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <FloatingOrbs count={4} />
      <main className="relative z-10 overflow-hidden px-6 pb-0 pt-20 md:px-12">
        <section className="mx-auto max-w-7xl">
          <HeroSection />
        </section>

        <Section className="mx-auto mt-16 max-w-7xl">
          <ValuePillars />
        </Section>

        <Section className="mx-auto mt-16 max-w-7xl">
          <IndustriesSection />
        </Section>

        <Section className="mx-auto mt-16 max-w-7xl">
          <AssistantPanel />
        </Section>

        <Section className="mx-auto mt-16 max-w-7xl">
          <RoiCalculator />
        </Section>

        <Section className="mx-auto mt-16 max-w-6xl">
          <PricingSection />
        </Section>

        <Section className="mx-auto mt-16 max-w-7xl">
          <ContactSection />
        </Section>

        <Section>
          <CTASection />
        </Section>
        <Footer />
      </main>
    </>
  );
}
