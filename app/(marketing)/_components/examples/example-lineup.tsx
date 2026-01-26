import { Lightbulb } from 'lucide-react'
import { MOCK_PLAYERS, MOCK_LINEUP_RATIONALE } from './mock-data'

export function ExampleLineup() {
  return (
    <div className="bg-anthropic-slate-elevated rounded-lg border border-white/10 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-anthropic-cream">AI-Generated Batting Order</h3>
          <span className="text-xs text-anthropic-terracotta bg-anthropic-terracotta/10 px-2 py-1 rounded-full">
            AI Powered
          </span>
        </div>
        <p className="text-sm text-anthropic-cream-muted mt-1">
          Optimized based on player stats and coach ratings
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {MOCK_LINEUP_RATIONALE.map((entry) => {
          const player = MOCK_PLAYERS.find((p) => p.id === entry.playerId)
          if (!player) return null

          return (
            <div
              key={entry.position}
              className="p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Batting Position */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-anthropic-terracotta text-white flex items-center justify-center font-bold text-sm">
                  {entry.position}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-anthropic-cream text-xs font-medium">
                      #{player.jersey}
                    </span>
                    <span className="font-medium text-anthropic-cream">
                      {player.name}
                    </span>
                    <span className="text-sm text-anthropic-cream-muted">
                      .{(player.obp * 1000).toFixed(0)} OBP
                    </span>
                  </div>

                  {/* AI Rationale */}
                  <div className="flex items-start gap-1.5 mt-1.5 text-sm text-anthropic-cream-muted">
                    <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{entry.reason}</span>
                  </div>
                </div>

                {/* Key Stat */}
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <div className="text-lg font-semibold text-anthropic-cream">
                    .{(player.avg * 1000).toFixed(0)}
                  </div>
                  <div className="text-xs text-anthropic-cream-muted">AVG</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Footer */}
      <div className="p-3 border-t border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center gap-2 text-xs text-anthropic-cream-muted">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>
            AI considers OBP, speed, power, and contact to optimize run production
          </span>
        </div>
      </div>
    </div>
  )
}
