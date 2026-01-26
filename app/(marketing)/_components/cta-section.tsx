import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
            Ready to Simplify Game Day?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Stop wrestling with spreadsheets. Let AI handle the lineup math
            while you focus on coaching.
          </p>
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
