import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Trophy, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Your Lineup Assistant for Youth Baseball & Softball
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Let AI handle the busywork, or take full control—your choice.
            Generate optimized lineups in seconds, then adjust anything you want.
          </p>

          {/* Value Props */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Lineups in seconds, not hours</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Data-driven advantage</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Ridiculously easy to use</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free during beta. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
