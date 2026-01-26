import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const benefits = [
  'Lineups in seconds, not hours',
  'Data-driven competitive edge',
  'Stay in control, always',
]

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-terracotta relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-fluid-3xl md:text-fluid-4xl font-semibold tracking-tight text-white">
            Ready to Make Game Day Easier?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join coaches who spend less time on spreadsheets and more time doing what they love—coaching their team.
          </p>

          {/* Benefits */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center justify-center gap-2 text-white/90"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-lg bg-white text-anthropic-terracotta hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/60">
            Free during beta. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
