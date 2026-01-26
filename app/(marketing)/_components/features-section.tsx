import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Zap, Shield, FileSpreadsheet, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Smart Lineup Generation',
    description:
      'AI analyzes player ratings and stats to create optimized batting orders and defensive assignments.',
  },
  {
    icon: Shield,
    title: '100% Rule Compliant',
    description:
      'Define your league rules once in plain language. The AI enforces them automatically every game.',
  },
  {
    icon: FileSpreadsheet,
    title: 'GameChanger Integration',
    description:
      'Import batting and fielding stats directly from GameChanger CSV exports.',
  },
  {
    icon: RefreshCw,
    title: 'Mid-Game Adjustments',
    description:
      'Lock positions, provide feedback, and regenerate remaining innings on the fly.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need for Game Day
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Spend less time on spreadsheets and more time coaching your team.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
