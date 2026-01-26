import { Upload, Wand2, Play, Clock } from 'lucide-react'

const steps = [
  {
    number: '1',
    icon: Upload,
    title: 'Import Your Roster',
    description: 'Paste from a spreadsheet or import GameChanger stats. Done in under a minute.',
    time: '~1 min',
  },
  {
    number: '2',
    icon: Wand2,
    title: 'Generate Lineup',
    description: 'One click. AI creates batting order + defensive positions for every inning.',
    time: '~5 sec',
  },
  {
    number: '3',
    icon: Play,
    title: 'Adjust & Play',
    description: 'Make any changes you want, or use it as-is. You\'re ready for game day.',
    time: 'Your call',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Ready in Minutes, Not Hours
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            No learning curve. No complicated setup. Just faster, smarter lineups.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-primary text-xs font-bold text-primary">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Clock className="h-3 w-3" />
                  {step.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Emphasis */}
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-foreground">
            That's it. Seriously.
          </p>
          <p className="mt-1 text-muted-foreground">
            Spend your time coaching, not wrestling with spreadsheets.
          </p>
        </div>
      </div>
    </section>
  )
}
