'use client'

import { cn } from '@/lib/utils'

interface PositionTogglesProps {
  eligibility: {
    can_pitch: boolean
    can_catch: boolean
    can_play_ss: boolean
    can_play_1b: boolean
  }
  onChange: (eligibility: {
    can_pitch: boolean
    can_catch: boolean
    can_play_ss: boolean
    can_play_1b: boolean
  }) => void
  readOnly?: boolean
}

const positions = [
  { key: 'can_pitch' as const, label: 'P', fullName: 'Pitcher' },
  { key: 'can_catch' as const, label: 'C', fullName: 'Catcher' },
  { key: 'can_play_ss' as const, label: 'SS', fullName: 'Shortstop' },
  { key: 'can_play_1b' as const, label: '1B', fullName: 'First Base' },
]

export function PositionToggles({ eligibility, onChange, readOnly = false }: PositionTogglesProps) {
  const togglePosition = (key: keyof typeof eligibility) => {
    if (readOnly) return
    onChange({
      ...eligibility,
      [key]: !eligibility[key],
    })
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {positions.map((pos) => (
        <button
          key={pos.key}
          type="button"
          onClick={() => togglePosition(pos.key)}
          disabled={readOnly}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
            eligibility[pos.key]
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted bg-muted/30 text-muted-foreground',
            !readOnly && 'hover:border-primary/50 cursor-pointer',
            readOnly && 'cursor-default'
          )}
        >
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
              eligibility[pos.key]
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {pos.label}
          </div>
          <div className="text-left">
            <div className="font-medium">{pos.fullName}</div>
            <div className="text-xs text-muted-foreground">
              {eligibility[pos.key] ? 'Eligible' : 'Not eligible'}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
