import { TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { MOCK_TEAM_ANALYSIS } from './mock-data'

const priorityColors = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500' },
  low: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', badge: 'bg-slate-500' },
}

export function ExampleTeamInsights() {
  return (
    <div className="bg-anthropic-slate-elevated rounded-lg border border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-anthropic-cream">Team Insights</h3>
          <div className="flex items-center gap-1.5 text-xs bg-anthropic-terracotta/10 text-anthropic-terracotta px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </div>
        </div>
      </div>

      {/* Summary Quote */}
      <div className="p-4 border-b border-white/10 bg-anthropic-terracotta/5">
        <p className="text-sm text-anthropic-cream italic">
          &ldquo;{MOCK_TEAM_ANALYSIS.summary}&rdquo;
        </p>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="p-4 border-b border-white/10">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-anthropic-cream">Strengths</span>
            </div>
            <div className="space-y-2">
              {MOCK_TEAM_ANALYSIS.strengths.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="font-medium text-emerald-400 text-sm">
                    {item.title}
                  </div>
                  <div className="text-emerald-300/70 text-sm mt-0.5">
                    {item.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Improve */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-anthropic-cream">Areas to Improve</span>
            </div>
            <div className="space-y-2">
              {MOCK_TEAM_ANALYSIS.weaknesses.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <div className="font-medium text-amber-400 text-sm">
                    {item.title}
                  </div>
                  <div className="text-amber-300/70 text-sm mt-0.5">
                    {item.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practice Recommendations */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-anthropic-terracotta" />
          <span className="font-medium text-anthropic-cream">Practice Recommendations</span>
        </div>
        <div className="space-y-3">
          {MOCK_TEAM_ANALYSIS.practiceRecommendations.map((rec, index) => {
            const colors = priorityColors[rec.priority]
            return (
              <div
                key={index}
                className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${colors.badge} text-white font-medium`}
                  >
                    {rec.priority}
                  </span>
                  <span className={`font-medium text-sm ${colors.text}`}>
                    {rec.title}
                  </span>
                </div>
                <div className={`text-sm ${colors.text} opacity-80`}>
                  <span className="font-medium">Drills: </span>
                  {rec.drills}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
