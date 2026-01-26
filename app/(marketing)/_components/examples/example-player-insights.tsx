import { TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              #{player.jersey}
            </span>
            <div>
              <h3 className="font-semibold text-lg">{player.name}</h3>
              <p className="text-sm text-muted-foreground">Season Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            AI Analyzed
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="text-lg font-semibold text-foreground mt-0.5">
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
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium text-foreground">Strengths</span>
          </div>
          <div className="space-y-2">
            {MOCK_PLAYER_ANALYSIS.strengths.map((strength, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-green-50 border border-green-100"
              >
                <div className="font-medium text-green-800 text-sm">
                  {strength.title}
                </div>
                <div className="text-green-700 text-sm mt-0.5">
                  {strength.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Develop */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-foreground">Areas to Develop</span>
          </div>
          <div className="space-y-2">
            {MOCK_PLAYER_ANALYSIS.weaknesses.map((weakness, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-amber-50 border border-amber-100"
              >
                <div className="font-medium text-amber-800 text-sm">
                  {weakness.title}
                </div>
                <div className="text-amber-700 text-sm mt-0.5">
                  {weakness.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Footer */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Recommended:</span>
          <Badge variant="secondary" className="text-xs">
            {MOCK_PLAYER_ANALYSIS.recommendations.batting}
          </Badge>
          <span className="text-muted-foreground text-sm">|</span>
          <span className="text-sm text-muted-foreground">Defense:</span>
          {MOCK_PLAYER_ANALYSIS.recommendations.defense.map((pos) => (
            <Badge key={pos} variant="outline" className="text-xs">
              {pos}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
