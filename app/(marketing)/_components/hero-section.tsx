import Link from 'next/link'
import { ArrowRight, Clock, Trophy, Sparkles } from 'lucide-react'

export function HeroSection({ billingEnabled }: { billingEnabled: boolean }) {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-anthropic-slate via-anthropic-slate to-anthropic-slate-light pointer-events-none" />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(250, 249, 240, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(19,19,20,0.4)_100%)] pointer-events-none" />

      {/* Terracotta glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-anthropic-terracotta/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main heading with fluid typography */}
          <h1 className="text-fluid-4xl md:text-fluid-5xl font-semibold tracking-tight text-anthropic-cream opacity-0 animate-text-reveal">
            Your Lineup Assistant for Youth Baseball & Softball
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-fluid-lg text-anthropic-cream-muted max-w-2xl mx-auto opacity-0 animate-text-reveal animate-delay-100">
            Let AI handle the busywork, or take full control—your choice.
            Generate optimized lineups in seconds, then adjust anything you want.
          </p>

          {/* Value Props with staggered animation */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center">
            <div className="flex items-center justify-center gap-2 text-anthropic-cream/70 opacity-0 animate-fade-in-up animate-delay-200">
              <Clock className="h-4 w-4 text-anthropic-terracotta" />
              <span className="text-sm">Lineups in seconds, not hours</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-anthropic-cream/70 opacity-0 animate-fade-in-up animate-delay-300">
              <Trophy className="h-4 w-4 text-anthropic-terracotta" />
              <span className="text-sm">Data-driven advantage</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-anthropic-cream/70 opacity-0 animate-fade-in-up animate-delay-400">
              <Sparkles className="h-4 w-4 text-anthropic-terracotta" />
              <span className="text-sm">Ridiculously easy to use</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up animate-delay-500">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium rounded-lg bg-anthropic-terracotta text-white hover:bg-anthropic-terracotta-light transition-all duration-200 glow-terracotta-sm hover:glow-terracotta"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium rounded-lg border border-anthropic-cream/30 text-anthropic-cream hover:bg-white/5 hover:border-anthropic-cream/50 transition-all duration-200"
            >
              Log In
            </Link>
          </div>

          <p className="mt-5 text-sm text-anthropic-cream/50 opacity-0 animate-fade-in animate-delay-600">
            {billingEnabled
              ? '14-Day Free Trial. No Credit Card Needed. $10/month after. Unlimited Teams.'
              : 'Free during beta. No credit card required.'}
          </p>
        </div>
      </div>
    </section>
  )
}
