import { HeroSection } from '@/components/marketing/hero-section'
import { AiTicker } from '@/components/marketing/ai-ticker'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'
import { FeaturesGrid } from '@/components/marketing/features-grid'
import { ClipsSection } from '@/components/marketing/clips-section'
import { TestimonialSection } from '@/components/marketing/testimonial-section'
import { LogosRow } from '@/components/marketing/logos-row'
import { CtaBanner } from '@/components/marketing/cta-banner'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <SiteHeader />
      <main>
        <HeroSection />
        <AiTicker />
        <DashboardPreview />
        <FeaturesGrid />
        <ClipsSection />
        <TestimonialSection />
        <LogosRow />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  )
}
