import { HeroSection } from './_components/hero-section'
import { FeaturesSection } from './_components/features-section'
import { ControlSection } from './_components/control-section'
import { ShowcaseSection } from './_components/showcase-section'
import { HowItWorksSection } from './_components/how-it-works-section'
import { CTASection } from './_components/cta-section'

export default function LandingPage() {
  const billingEnabled = process.env.BILLING_ENABLED === 'true'

  return (
    <>
      <HeroSection billingEnabled={billingEnabled} />
      <FeaturesSection />
      <ControlSection />
      <ShowcaseSection />
      <HowItWorksSection />
      <CTASection billingEnabled={billingEnabled} />
    </>
  )
}
