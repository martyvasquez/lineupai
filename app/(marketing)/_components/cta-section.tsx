import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const benefits = [
  'Lineups in seconds, not hours',
  'Data-driven competitive edge',
  'Stay in control, always',
]

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
            Ready to Make Game Day Easier?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join coaches who spend less time on spreadsheets and more time doing what they love—coaching their team.
          </p>

          {/* Benefits */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center justify-center gap-2 text-primary-foreground/90"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Free during beta. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
