import HeroSection from '@/components/HeroSection';
import ValuePillars from '@/components/ValuePillars';
import IndustriesSection from '@/components/IndustriesSection';
import AssistantPanel from '@/components/AssistantPanel';
import RoiCalculator from '@/components/RoiCalculator';
import PricingSection from '@/components/PricingSection';
import ContactSection from '@/components/ContactSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="relative z-10 overflow-hidden px-4 pb-0 pt-20 sm:px-6 md:px-12">
      <section className="mx-auto max-w-7xl">
        <HeroSection />
      </section>

      <section className="mx-auto mt-12 md:mt-16 max-w-7xl">
        <ValuePillars />
      </section>

      <section className="mx-auto mt-12 md:mt-16 max-w-7xl">
        <IndustriesSection />
      </section>

      <section className="mx-auto mt-12 md:mt-16 max-w-7xl">
        <AssistantPanel />
      </section>

      <section className="mx-auto mt-12 md:mt-16 max-w-7xl">
        <RoiCalculator />
      </section>

      <section className="mx-auto mt-12 md:mt-16 max-w-6xl">
        <PricingSection />
      </section>

      <section className="mx-auto mt-12 md:mt-16 max-w-7xl">
        <ContactSection />
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <CTASection />
      </section>
      <Footer />
    </main>
  );
}
