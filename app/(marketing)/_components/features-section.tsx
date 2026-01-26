import { BarChart3, Brain, Star, Shield, Zap, ListOrdered } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'GameChanger Stats',
    description:
      'Import real batting, fielding, and pitching stats directly from GameChanger. AI analyzes AVG, OBP, SLG, fielding percentage, and more.',
  },
  {
    icon: Star,
    title: 'Coach Ratings',
    description:
      'Rate players on 14 skills you observe at practice—plate discipline, arm strength, baseball IQ. Things the stats don\'t capture.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description:
      'Our AI combines your ratings with real game stats to understand each player\'s true strengths and optimal role.',
  },
  {
    icon: ListOrdered,
    title: 'Optimized Batting Orders',
    description:
      'AI builds batting orders that maximize run production—right OBP at leadoff, power in the middle, speed where it matters.',
  },
  {
    icon: Zap,
    title: 'Smart Defensive Rotations',
    description:
      'Automatic position assignments that respect player strengths, ensure fair playing time, and keep your best defenders where they count.',
  },
  {
    icon: Shield,
    title: 'Rule Compliance Built-In',
    description:
      'Define your league rules once. AI generates lineups that are 100% compliant—every player, every inning, every game.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-anthropic-slate-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-fluid-3xl md:text-fluid-4xl font-semibold tracking-tight text-anthropic-cream">
            Data-Driven Lineups, Powered by AI
          </h2>
          <p className="mt-4 text-fluid-base text-anthropic-cream-muted max-w-2xl mx-auto">
            Combine real GameChanger statistics with your coaching insights.
            AI does the analysis—you get optimized lineups in seconds.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-anthropic-cream-subtle border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-anthropic-terracotta/10">
                <feature.icon className="h-6 w-6 text-anthropic-terracotta" />
              </div>
              <h3 className="text-xl font-semibold text-anthropic-cream mb-2">
                {feature.title}
              </h3>
              <p className="text-anthropic-cream-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
