import { TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MOCK_TEAM_ANALYSIS } from './mock-data'

const priorityColors = {
  high: { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
  medium: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' },
  low: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-500' },
}

export function ExampleTeamInsights() {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Team Insights</h3>
          <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </div>
        </div>
      </div>

      {/* Summary Quote */}
      <div className="p-4 border-b bg-primary/5">
        <p className="text-sm text-foreground italic">
          &ldquo;{MOCK_TEAM_ANALYSIS.summary}&rdquo;
        </p>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="p-4 border-b">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-foreground">Strengths</span>
            </div>
            <div className="space-y-2">
              {MOCK_TEAM_ANALYSIS.strengths.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-green-50 border border-green-100"
                >
                  <div className="font-medium text-green-800 text-sm">
                    {item.title}
                  </div>
                  <div className="text-green-700 text-sm mt-0.5">
                    {item.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Improve */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-foreground">Areas to Improve</span>
            </div>
            <div className="space-y-2">
              {MOCK_TEAM_ANALYSIS.weaknesses.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <div className="font-medium text-amber-800 text-sm">
                    {item.title}
                  </div>
                  <div className="text-amber-700 text-sm mt-0.5">
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
          <Target className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Practice Recommendations</span>
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
                  <Badge
                    className={`text-[10px] uppercase ${colors.badge} text-white border-0`}
                  >
                    {rec.priority}
                  </Badge>
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
