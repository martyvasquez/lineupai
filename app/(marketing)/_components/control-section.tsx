'use client'

import { useState } from 'react'
import { ChevronDown, Check, Lock, Sparkles } from 'lucide-react'

// Mock dropdown options matching the real app
const RULE_GROUPS = [
  { value: 'league', label: 'League Rules', description: 'Everyone plays 3+ innings, balanced batting' },
  { value: 'tournament', label: 'Tournament Mode', description: 'Best lineup for competitive games' },
  { value: 'practice', label: 'Practice Game', description: 'Maximum rotation, try new positions' },
]

const GAME_PRIORITIES = [
  { value: 'win', label: 'Win', description: 'Maximize winning' },
  { value: 'win-leaning', label: 'Win-Leaning', description: 'Favor winning, some development' },
  { value: 'balanced', label: 'Balanced', description: 'Equal weight' },
  { value: 'dev-leaning', label: 'Development-Leaning', description: 'Favor development' },
  { value: 'develop', label: 'Develop', description: 'Focus on growth' },
]

const DATA_WEIGHTINGS = [
  { value: 'gc-only', label: 'GameChanger Only', description: 'Use only stats' },
  { value: 'gc-heavy', label: 'Stats-Heavy (75/25)', description: 'Prioritize stats' },
  { value: 'equal', label: 'Balanced (50/50)', description: 'Both equally' },
  { value: 'coach-heavy', label: 'Ratings-Heavy (75/25)', description: 'Prioritize your ratings' },
  { value: 'coach-only', label: 'Coach Ratings Only', description: 'Use only your ratings' },
]

interface MockDropdownProps {
  label: string
  options: { value: string; label: string; description: string }[]
  selectedIndex: number
  onSelect: (index: number) => void
  highlightMiddle?: boolean
}

function MockDropdown({ label, options, selectedIndex, onSelect, highlightMiddle }: MockDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options[selectedIndex]

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-lg text-left hover:border-primary/50 transition-colors"
        >
          <span className="font-medium text-foreground">{selected.label}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
            {options.map((option, index) => {
              const isSelected = index === selectedIndex
              const isMiddle = highlightMiddle && index === Math.floor(options.length / 2)

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(index)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-left transition-colors
                    ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                    ${isMiddle && !isSelected ? 'bg-amber-50' : ''}
                  `}
                >
                  <div>
                    <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{selected.description}</p>
    </div>
  )
}

export function ControlSection() {
  const [ruleGroup, setRuleGroup] = useState(0)
  const [priority, setPriority] = useState(2) // Balanced
  const [weighting, setWeighting] = useState(2) // Equal

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            You Set the Strategy
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every game is different. Configure exactly how you want AI to build your lineup—then adjust anything you want.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Mock Game Setup UI */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Game Setup</h3>
                <p className="text-sm text-muted-foreground">Configure your lineup preferences</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Rule Group Dropdown */}
              <MockDropdown
                label="Rule Group"
                options={RULE_GROUPS}
                selectedIndex={ruleGroup}
                onSelect={setRuleGroup}
              />

              {/* Game Priority Dropdown */}
              <MockDropdown
                label="Game Priority"
                options={GAME_PRIORITIES}
                selectedIndex={priority}
                onSelect={setPriority}
                highlightMiddle
              />

              {/* Data Weighting Dropdown */}
              <MockDropdown
                label="Data Weighting"
                options={DATA_WEIGHTINGS}
                selectedIndex={weighting}
                onSelect={setWeighting}
                highlightMiddle
              />
            </div>

            {/* Generate Button */}
            <div className="mt-6 pt-6 border-t">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <Sparkles className="h-4 w-4" />
                Generate Lineup
              </button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                AI generates a complete lineup based on your settings
              </p>
            </div>
          </div>

          {/* Explanation Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white border">
              <h4 className="font-semibold text-foreground mb-2">Rule Groups</h4>
              <p className="text-sm text-muted-foreground">
                Create different rule sets for league games, tournaments, or practice. AI enforces them automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border">
              <h4 className="font-semibold text-foreground mb-2">Game Priority</h4>
              <p className="text-sm text-muted-foreground">
                Slide between "Win" and "Develop" for each game. Big tournament? Go competitive. Early season? Focus on growth.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border">
              <h4 className="font-semibold text-foreground mb-2">Data Weighting</h4>
              <p className="text-sm text-muted-foreground">
                Trust the stats, your own ratings, or both. You know things about your players that numbers can't show.
              </p>
            </div>
          </div>

          {/* Lock Feature Callout */}
          <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Lock Any Position</h4>
                <p className="text-sm text-muted-foreground">
                  After AI generates your lineup, you can lock specific players in specific positions for any inning.
                  Want Cole to pitch innings 1-2? Lock it. AI fills around your decisions—never overrides them.
                  <span className="text-primary font-medium"> You always have final say.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
