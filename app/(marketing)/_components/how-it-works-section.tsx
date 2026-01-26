import { Check } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Build Your Roster',
    description:
      'Add players manually or import from CSV. Rate each player across 14 categories like contact, fielding, and baseball IQ.',
  },
  {
    number: '2',
    title: 'Define Your Rules',
    description:
      'Write rules in plain language like "Everyone bats at least once" or "No player sits two innings in a row."',
  },
  {
    number: '3',
    title: 'Generate & Go',
    description:
      'Click generate and get a complete lineup in seconds. Review, adjust if needed, and head to the field.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get from roster to lineup in three simple steps.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
