import { TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { MOCK_PLAYERS, MOCK_PLAYER_ANALYSIS } from './mock-data'

export function ExamplePlayerInsights() {
  const player = MOCK_PLAYERS.find((p) => p.id === MOCK_PLAYER_ANALYSIS.playerId)

  if (!player) return null

  const stats = [
    { label: 'AVG', value: `.${(player.avg * 1000).toFixed(0)}` },
    { label: 'OBP', value: `.${(player.obp * 1000).toFixed(0)}` },
    { label: 'SLG', value: `.${(player.slg * 1000).toFixed(0)}` },
    { label: 'H', value: player.h.toString() },
    { label: 'BB%', value: '12%' },
    { label: 'K%', value: '15%' },
    { label: 'SB', value: player.sb.toString() },
    { label: 'FPCT', value: `.${(player.fpct * 1000).toFixed(0)}` },
  ]

  return (
    <div className="bg-anthropic-slate-elevated rounded-lg border border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-anthropic-terracotta text-white font-bold">
              #{player.jersey}
            </span>
            <div>
              <h3 className="font-semibold text-lg text-anthropic-cream">{player.name}</h3>
              <p className="text-sm text-anthropic-cream-muted">Season Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-anthropic-terracotta/10 text-anthropic-terracotta px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            AI Analyzed
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 border-b border-white/10">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xs text-anthropic-cream-muted uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="text-lg font-semibold text-anthropic-cream mt-0.5">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="p-4 space-y-4">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-anthropic-cream">Strengths</span>
          </div>
          <div className="space-y-2">
            {MOCK_PLAYER_ANALYSIS.strengths.map((strength, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="font-medium text-emerald-400 text-sm">
                  {strength.title}
                </div>
                <div className="text-emerald-300/70 text-sm mt-0.5">
                  {strength.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Develop */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-anthropic-cream">Areas to Develop</span>
          </div>
          <div className="space-y-2">
            {MOCK_PLAYER_ANALYSIS.weaknesses.map((weakness, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <div className="font-medium text-amber-400 text-sm">
                  {weakness.title}
                </div>
                <div className="text-amber-300/70 text-sm mt-0.5">
                  {weakness.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Footer */}
      <div className="p-4 border-t border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center gap-2 flex-wrap">
          <Target className="h-4 w-4 text-anthropic-terracotta" />
          <span className="text-sm font-medium text-anthropic-cream">Recommended:</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-anthropic-cream text-xs">
            {MOCK_PLAYER_ANALYSIS.recommendations.batting}
          </span>
          <span className="text-anthropic-cream-muted text-sm">|</span>
          <span className="text-sm text-anthropic-cream-muted">Defense:</span>
          {MOCK_PLAYER_ANALYSIS.recommendations.defense.map((pos) => (
            <span key={pos} className="px-2 py-0.5 rounded border border-white/20 text-anthropic-cream text-xs">
              {pos}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
