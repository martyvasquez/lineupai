'use client'

import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { MOCK_DEFENSIVE_INNINGS } from './mock-data'

// Position layout matching a real baseball field view from behind home plate
// Row 1: Outfield (LF, CF, RF)
// Row 2: Infield (3B, SS, 2B, 1B)
// Row 3: Pitcher
// Row 4: Catcher
const FIELD_ROWS = [
  { positions: ['LF', 'CF', 'RF'], label: 'Outfield' },
  { positions: ['3B', 'SS', '2B', '1B'], label: 'Infield' },
  { positions: ['P'], label: 'Pitcher' },
  { positions: ['C'], label: 'Catcher' },
]

const PREMIUM_POSITIONS = ['P', 'C', 'SS', '1B']

interface PositionBubbleProps {
  position: string
  playerName: string
}

function PositionBubble({ position, playerName }: PositionBubbleProps) {
  const isPremium = PREMIUM_POSITIONS.includes(position)

  return (
    <div
      className={`
        w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center text-xs
        ${isPremium
          ? 'bg-primary/10 border-2 border-primary/30'
          : 'bg-muted border border-border'
        }
      `}
    >
      <span className={`font-bold text-sm ${isPremium ? 'text-primary' : 'text-foreground'}`}>
        {position}
      </span>
      <span className="text-muted-foreground truncate max-w-[56px] text-[11px]">
        {playerName}
      </span>
    </div>
  )
}

export function ExampleDefensive() {
  const [selectedInning, setSelectedInning] = useState(1)
  const currentInning = MOCK_DEFENSIVE_INNINGS.find(
    (i) => i.inning === selectedInning
  )

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Defensive Strategy</h3>
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full">
            AI Positioned
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Optimized rotations based on arm strength and range
        </p>
      </div>

      {/* Inning Tabs */}
      <div className="flex border-b">
        {MOCK_DEFENSIVE_INNINGS.map((inning) => (
          <button
            key={inning.inning}
            onClick={() => setSelectedInning(inning.inning)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium transition-colors
              ${selectedInning === inning.inning
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/50 text-muted-foreground'
              }
            `}
          >
            Inning {inning.inning}
          </button>
        ))}
      </div>

      {/* Baseball Field Layout */}
      {currentInning && (
        <div className="p-4 sm:p-6">
          <div className="relative mx-auto max-w-[320px]">
            {/* Field background hint */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-green-100/50 rounded-xl -z-10" />

            <div className="py-4 space-y-3">
              {/* Outfield Row - LF, CF, RF */}
              <div className="flex justify-center gap-4 sm:gap-6">
                {FIELD_ROWS[0].positions.map((pos) => (
                  <PositionBubble
                    key={pos}
                    position={pos}
                    playerName={currentInning.positions[pos as keyof typeof currentInning.positions]}
                  />
                ))}
              </div>

              {/* Infield Row - 3B, SS, 2B, 1B */}
              <div className="flex justify-center gap-2 sm:gap-4">
                {FIELD_ROWS[1].positions.map((pos) => (
                  <PositionBubble
                    key={pos}
                    position={pos}
                    playerName={currentInning.positions[pos as keyof typeof currentInning.positions]}
                  />
                ))}
              </div>

              {/* Pitcher Row */}
              <div className="flex justify-center">
                <PositionBubble
                  position="P"
                  playerName={currentInning.positions.P}
                />
              </div>

              {/* Catcher Row */}
              <div className="flex justify-center">
                <PositionBubble
                  position="C"
                  playerName={currentInning.positions.C}
                />
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  AI Reasoning:
                </span>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentInning.reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
