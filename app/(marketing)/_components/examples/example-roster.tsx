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
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )
}

export function ExampleRoster() {
  const [activeTab, setActiveTab] = useState<'info' | 'ratings' | 'positions'>('ratings')

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              #{MOCK_PLAYER.jersey}
            </span>
            <div>
              <h3 className="font-semibold text-lg">{MOCK_PLAYER.name}</h3>
              <p className="text-sm text-muted-foreground">Player Setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {(['info', 'ratings', 'positions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-4 py-2.5 text-sm font-medium transition-colors capitalize
              ${activeTab === tab
                ? 'bg-white text-foreground border-b-2 border-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
              <label className="text-sm font-medium text-foreground">Name</label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg border text-foreground">
                {MOCK_PLAYER.name}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Jersey Number</label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg border text-foreground w-20">
                {MOCK_PLAYER.jersey}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-sm font-medium text-foreground">Active Player</label>
              <div className={`w-10 h-6 rounded-full relative ${MOCK_PLAYER.active ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${MOCK_PLAYER.active ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Rate each skill from 1-5 stars based on your observation.
            </p>

            {/* Batting */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Batting</h4>
              <div className="space-y-1.5">
                {MOCK_RATINGS.batting.map((rating) => (
                  <div key={rating.label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{rating.label}</span>
                    <StarRating value={rating.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Athletic */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Athletic</h4>
              <div className="space-y-1.5">
                {MOCK_RATINGS.athletic.map((rating) => (
                  <div key={rating.label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{rating.label}</span>
                    <StarRating value={rating.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Fielding */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Fielding</h4>
              <div className="space-y-1.5">
                {MOCK_RATINGS.fielding.map((rating) => (
                  <div key={rating.label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{rating.label}</span>
                    <StarRating value={rating.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Notes preview */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Coach Notes</h4>
              <div className="px-3 py-2 bg-muted/30 rounded-lg border border-dashed text-sm text-muted-foreground">
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
              <h4 className="font-medium text-sm text-foreground">Position Strengths</h4>
              <p className="text-sm text-muted-foreground">
                Drag to reorder. AI places players at their strongest position when possible.
              </p>
              <div className="space-y-1.5 mt-3">
                {MOCK_POSITIONS.map((pos, index) => (
                  <div
                    key={pos}
                    className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border cursor-grab"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{pos}</span>
                    {index === 0 && (
                      <span className="ml-auto text-xs text-primary font-medium">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Position Eligibility */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium text-sm text-foreground">Premium Position Eligibility</h4>
              <p className="text-sm text-muted-foreground">
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
                      ${item.checked ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'}
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center
                      ${item.checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'}
                    `}>
                      {item.checked && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-sm ${item.checked ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
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
      <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
        <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg border bg-white">
          Cancel
        </button>
        <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90">
          Save Changes
        </button>
      </div>
    </div>
  )
}
