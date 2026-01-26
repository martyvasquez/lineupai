'use client'

import { useState } from 'react'
import { Star, GripVertical, Check } from 'lucide-react'

// Mock data for the player
const MOCK_PLAYER = {
  name: 'Jake Martinez',
  jersey: 12,
  active: true,
}

const MOCK_RATINGS = {
  batting: [
    { label: 'Plate Discipline', value: 4 },
    { label: 'Contact Ability', value: 5 },
    { label: 'Batting Power', value: 3 },
  ],
  athletic: [
    { label: 'Run Speed', value: 4 },
    { label: 'Baseball IQ', value: 5 },
    { label: 'Attention', value: 4 },
  ],
  fielding: [
    { label: 'Fielding Hands', value: 4 },
    { label: 'Throw Accuracy', value: 4 },
    { label: 'Arm Strength', value: 3 },
    { label: 'Fly Ball Ability', value: 4 },
  ],
  pitching: [
    { label: 'Pitch Control', value: 3 },
    { label: 'Pitch Velocity', value: 3 },
    { label: 'Pitch Composure', value: 4 },
  ],
  catching: [
    { label: 'Catcher Ability', value: 2 },
  ],
}

const MOCK_POSITIONS = ['SS', '2B', 'CF', '3B', 'LF', 'RF']

const MOCK_ELIGIBILITY = {
  pitch: true,
  catch: false,
  ss: true,
  '1b': false,
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < value
              ? 'fill-amber-400 text-amber-400'
              : 'fill-white/10 text-white/10'
          }`}
        />
      ))}
    </div>
  )
}

export function ExampleRoster() {
  const [activeTab, setActiveTab] = useState<'info' | 'ratings' | 'positions'>('ratings')

  return (
    <div className="bg-anthropic-slate-elevated rounded-lg border border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-anthropic-terracotta text-white font-bold">
              #{MOCK_PLAYER.jersey}
            </span>
            <div>
              <h3 className="font-semibold text-lg text-anthropic-cream">{MOCK_PLAYER.name}</h3>
              <p className="text-sm text-anthropic-cream-muted">Player Setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['info', 'ratings', 'positions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-4 py-2.5 text-sm font-medium transition-colors capitalize
              ${activeTab === tab
                ? 'bg-anthropic-slate-elevated text-anthropic-cream border-b-2 border-anthropic-terracotta -mb-px'
                : 'text-anthropic-cream-muted hover:text-anthropic-cream hover:bg-white/5'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-anthropic-cream">Name</label>
              <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-anthropic-cream">
                {MOCK_PLAYER.name}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-anthropic-cream">Jersey Number</label>
              <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-anthropic-cream w-20">
                {MOCK_PLAYER.jersey}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-sm font-medium text-anthropic-cream">Active Player</label>
              <div className={`w-10 h-6 rounded-full relative ${MOCK_PLAYER.active ? 'bg-anthropic-terracotta' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${MOCK_PLAYER.active ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-5">
            <p className="text-sm text-anthropic-cream-muted">
              Rate each skill from 1-5 stars based on your observation.
            </p>

            {/* Batting */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-anthropic-cream-muted uppercase tracking-wide">Batting</h4>
              <div className="space-y-1.5">
                {MOCK_RATINGS.batting.map((rating) => (
                  <div key={rating.label} className="flex items-center justify-between">
                    <span className="text-sm text-anthropic-cream">{rating.label}</span>
                    <StarRating value={rating.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Athletic */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-anthropic-cream-muted uppercase tracking-wide">Athletic</h4>
              <div className="space-y-1.5">
                {MOCK_RATINGS.athletic.map((rating) => (
                  <div key={rating.label} className="flex items-center justify-between">
                    <span className="text-sm text-anthropic-cream">{rating.label}</span>
                    <StarRating value={rating.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Fielding */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-anthropic-cream-muted uppercase tracking-wide">Fielding</h4>
              <div className="space-y-1.5">
                {MOCK_RATINGS.fielding.map((rating) => (
                  <div key={rating.label} className="flex items-center justify-between">
                    <span className="text-sm text-anthropic-cream">{rating.label}</span>
                    <StarRating value={rating.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Notes preview */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <h4 className="font-medium text-xs text-anthropic-cream-muted uppercase tracking-wide">Coach Notes</h4>
              <div className="px-3 py-2 bg-white/5 rounded-lg border border-dashed border-white/20 text-sm text-anthropic-cream-muted">
                Great attitude, natural leader. Working on power hitting. Excels under pressure.
              </div>
            </div>
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="space-y-5">
            {/* Position Strengths */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-anthropic-cream">Position Strengths</h4>
              <p className="text-sm text-anthropic-cream-muted">
                Drag to reorder. AI places players at their strongest position when possible.
              </p>
              <div className="space-y-1.5 mt-3">
                {MOCK_POSITIONS.map((pos, index) => (
                  <div
                    key={pos}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 cursor-grab"
                  >
                    <GripVertical className="h-4 w-4 text-anthropic-cream-muted" />
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-anthropic-terracotta/10 text-anthropic-terracotta text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-anthropic-cream">{pos}</span>
                    {index === 0 && (
                      <span className="ml-auto text-xs text-anthropic-terracotta font-medium">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Position Eligibility */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <h4 className="font-medium text-sm text-anthropic-cream">Premium Position Eligibility</h4>
              <p className="text-sm text-anthropic-cream-muted">
                These positions require specific skills. Check positions this player is qualified for.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { key: 'pitch', label: 'Can Pitch', checked: MOCK_ELIGIBILITY.pitch },
                  { key: 'catch', label: 'Can Catch', checked: MOCK_ELIGIBILITY.catch },
                  { key: 'ss', label: 'Can Play SS', checked: MOCK_ELIGIBILITY.ss },
                  { key: '1b', label: 'Can Play 1B', checked: MOCK_ELIGIBILITY['1b'] },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer
                      ${item.checked ? 'bg-anthropic-terracotta/10 border-anthropic-terracotta/30' : 'bg-white/5 border-white/10'}
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center
                      ${item.checked ? 'bg-anthropic-terracotta border-anthropic-terracotta' : 'border-white/30'}
                    `}>
                      {item.checked && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-sm ${item.checked ? 'text-anthropic-cream font-medium' : 'text-anthropic-cream-muted'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-anthropic-cream-subtle flex justify-end gap-2">
        <button className="px-4 py-2 text-sm font-medium text-anthropic-cream-muted hover:text-anthropic-cream rounded-lg border border-white/10 bg-white/5">
          Cancel
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-anthropic-terracotta rounded-lg hover:bg-anthropic-terracotta-light">
          Save Changes
        </button>
      </div>
    </div>
  )
}
