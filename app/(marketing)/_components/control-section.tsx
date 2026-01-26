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
      <label className="text-sm font-medium text-anthropic-cream/80">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-anthropic-slate-elevated border border-white/10 rounded-lg text-left hover:border-anthropic-terracotta/50 transition-colors"
        >
          <span className="font-medium text-anthropic-cream">{selected.label}</span>
          <ChevronDown className={`h-4 w-4 text-anthropic-cream-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-anthropic-slate-elevated border border-white/10 rounded-lg shadow-xl overflow-hidden">
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
                    ${isSelected ? 'bg-anthropic-terracotta/20' : 'hover:bg-white/5'}
                    ${isMiddle && !isSelected ? 'bg-anthropic-terracotta/10' : ''}
                  `}
                >
                  <div>
                    <div className={`font-medium ${isSelected ? 'text-anthropic-terracotta' : 'text-anthropic-cream'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-anthropic-cream-muted">{option.description}</div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-anthropic-terracotta flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-anthropic-cream-muted">{selected.description}</p>
    </div>
  )
}

export function ControlSection() {
  const [ruleGroup, setRuleGroup] = useState(0)
  const [priority, setPriority] = useState(2) // Balanced
  const [weighting, setWeighting] = useState(2) // Equal

  return (
    <section className="py-20 md:py-28 bg-anthropic-slate">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-fluid-3xl md:text-fluid-4xl font-semibold tracking-tight text-anthropic-cream">
            You Set the Strategy
          </h2>
          <p className="mt-4 text-fluid-base text-anthropic-cream-muted max-w-2xl mx-auto">
            Every game is different. Configure exactly how you want AI to build your lineup—then adjust anything you want.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Mock Game Setup UI */}
          <div className="bg-anthropic-slate-light rounded-2xl p-6 md:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-anthropic-terracotta/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-anthropic-terracotta" />
              </div>
              <div>
                <h3 className="font-semibold text-anthropic-cream">Game Setup</h3>
                <p className="text-sm text-anthropic-cream-muted">Configure your lineup preferences</p>
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
            <div className="mt-6 pt-6 border-t border-white/10">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-anthropic-terracotta text-white rounded-lg font-medium hover:bg-anthropic-terracotta-light transition-colors">
                <Sparkles className="h-4 w-4" />
                Generate Lineup
              </button>
              <p className="text-xs text-center text-anthropic-cream-muted mt-2">
                AI generates a complete lineup based on your settings
              </p>
            </div>
          </div>

          {/* Explanation Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="p-5 rounded-xl bg-anthropic-cream-subtle border border-white/10">
              <h4 className="font-semibold text-anthropic-cream mb-2">Rule Groups</h4>
              <p className="text-sm text-anthropic-cream-muted">
                Create different rule sets for league games, tournaments, or practice. AI enforces them automatically.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-anthropic-cream-subtle border border-white/10">
              <h4 className="font-semibold text-anthropic-cream mb-2">Game Priority</h4>
              <p className="text-sm text-anthropic-cream-muted">
                Slide between "Win" and "Develop" for each game. Big tournament? Go competitive. Early season? Focus on growth.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-anthropic-cream-subtle border border-white/10">
              <h4 className="font-semibold text-anthropic-cream mb-2">Data Weighting</h4>
              <p className="text-sm text-anthropic-cream-muted">
                Trust the stats, your own ratings, or both. You know things about your players that numbers can't show.
              </p>
            </div>
          </div>

          {/* Lock Feature Callout */}
          <div className="mt-8 p-6 rounded-xl bg-anthropic-terracotta/10 border border-anthropic-terracotta/30">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-anthropic-terracotta/20 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-anthropic-terracotta" />
              </div>
              <div>
                <h4 className="font-semibold text-anthropic-cream mb-1">Lock Any Position</h4>
                <p className="text-sm text-anthropic-cream-muted">
                  After AI generates your lineup, you can lock specific players in specific positions for any inning.
                  Want Cole to pitch innings 1-2? Lock it. AI fills around your decisions—never overrides them.
                  <span className="text-anthropic-terracotta font-medium"> You always have final say.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
