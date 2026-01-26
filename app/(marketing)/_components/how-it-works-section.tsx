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
    <section className="py-20 md:py-28 bg-anthropic-slate">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-fluid-3xl md:text-fluid-4xl font-semibold tracking-tight text-anthropic-cream">
            Ready in Minutes, Not Hours
          </h2>
          <p className="mt-4 text-fluid-base text-anthropic-cream-muted max-w-2xl mx-auto">
            No learning curve. No complicated setup. Just faster, smarter lineups.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-anthropic-terracotta/40 to-anthropic-terracotta/10" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-anthropic-terracotta text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-anthropic-slate border-2 border-anthropic-terracotta text-xs font-bold text-anthropic-terracotta">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-anthropic-cream">
                  {step.title}
                </h3>
                <p className="mt-2 text-anthropic-cream-muted leading-relaxed">{step.description}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-anthropic-terracotta font-medium">
                  <Clock className="h-3 w-3" />
                  {step.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Emphasis */}
        <div className="mt-14 text-center">
          <p className="text-lg font-medium text-anthropic-cream">
            That's it. Seriously.
          </p>
          <p className="mt-1 text-anthropic-cream-muted">
            Spend your time coaching, not wrestling with spreadsheets.
          </p>
        </div>
      </div>
    </section>
  )
}
