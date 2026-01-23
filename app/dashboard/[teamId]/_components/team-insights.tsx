'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'
import {
  Upload,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  ChevronRight,
  Clock,
  Users,
  BarChart3,
} from 'lucide-react'
import { format } from 'date-fns'
import type { TeamAnalysis } from '@/types/lineup'

interface TeamInsightsProps {
  teamId: string
  hasStats: boolean
  statsCount: number
  playerCount: number
  statsImportedAt: string | null
  teamAnalysis: TeamAnalysis | null
  teamAnalyzedAt: string | null
}

export function TeamInsights({
  teamId,
  hasStats,
  statsCount,
  playerCount,
  statsImportedAt,
  teamAnalysis,
  teamAnalyzedAt,
}: TeamInsightsProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAnalyze = async () => {
    setAnalyzing(true)

    try {
      const response = await fetch('/api/stats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, include_team_analysis: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate analysis')
      }

      // Check for team analysis error
      if (data.team_analysis_error) {
        toast({
          title: 'Partial analysis complete',
          description: `Analyzed ${data.analyzed_count} players. Team analysis failed: ${data.team_analysis_error}`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Analysis complete',
          description: `Generated insights for ${data.analyzed_count} players${data.team_analysis ? ' and your team' : ''}.`,
        })
      }

      // Force a hard refresh to pick up new data
      router.refresh()
    } catch (err) {
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Failed to generate analysis',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  // No stats uploaded - prompt to upload
  if (!hasStats) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Insights
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis of your team's strengths and areas for improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">No GameChanger stats uploaded</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Upload your team's GameChanger CSV file to unlock AI-powered insights
                about your players and team performance.
              </p>
            </div>
            <Link href={`/dashboard/${teamId}/stats`}>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Stats CSV
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Has stats but no analysis yet
  if (!teamAnalysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Team Insights
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your team's performance
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {statsCount}/{playerCount} with stats
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">Ready to analyze</p>
              <p className="text-sm text-muted-foreground max-w-md">
                You have stats for {statsCount} players. Generate AI insights to see
                team strengths, weaknesses, and practice recommendations.
              </p>
            </div>
            {statsImportedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                <Clock className="h-4 w-4" />
                <span>Data imported {format(new Date(statsImportedAt), 'MMMM d, yyyy')}</span>
              </div>
            )}
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Has analysis - show insights
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Team Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your team's performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data source info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>
              Analysis based on data imported{' '}
              <span className="font-medium text-foreground">
                {statsImportedAt ? format(new Date(statsImportedAt), 'MMMM d, yyyy') : 'unknown date'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {teamAnalyzedAt && (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Generated {format(new Date(teamAnalyzedAt), 'MMM d')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {statsCount}/{playerCount} players
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">{teamAnalysis.summary}</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-1.5 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Team Strengths
            </h4>
            <div className="space-y-2">
              {teamAnalysis.team_strengths.slice(0, 3).map((strength, idx) => (
                <div key={idx} className="text-sm p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="font-medium text-green-800">{strength.category}</p>
                  <p className="text-green-700 text-xs mt-1">{strength.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-1.5 text-amber-700">
              <TrendingDown className="h-4 w-4" />
              Areas for Improvement
            </h4>
            <div className="space-y-2">
              {teamAnalysis.team_weaknesses.slice(0, 3).map((weakness, idx) => (
                <div key={idx} className="text-sm p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-800">{weakness.category}</p>
                  <p className="text-amber-700 text-xs mt-1">{weakness.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Practice Recommendations */}
        {teamAnalysis.practice_recommendations && teamAnalysis.practice_recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              Practice Recommendations
            </h4>
            <div className="space-y-2">
              {teamAnalysis.practice_recommendations.slice(0, 2).map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Badge
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs mt-0.5"
                  >
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rec.focus_area}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rec.drill_suggestions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Full Stats Link */}
        <div className="pt-2">
          <Link href={`/dashboard/${teamId}/stats`}>
            <Button variant="outline" className="w-full">
              View Full Stats & Player Analysis
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
