import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Data-Driven Lineups, Powered by AI
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Combine real GameChanger statistics with your coaching insights.
            AI does the analysis—you get optimized lineups in seconds.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
