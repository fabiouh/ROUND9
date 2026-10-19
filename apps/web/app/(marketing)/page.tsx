import { Crew, FinalCta, Hero, HowItWorks, Preview, Pricing, Social, Tournaments } from '@/components/marketing/sections';
import { SiteHeader } from '@/components/marketing/site-header';

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Social />
        <HowItWorks />
        <Tournaments />
        <Crew />
        <Preview />
        <Pricing />
        <FinalCta />
      </main>
    </>
  );
}
