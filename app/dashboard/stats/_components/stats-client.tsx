'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/lib/hooks/use-toast'
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { parseGameChangerCSV, matchPlayers, type MatchResult } from '@/lib/parsers/gamechanger-csv'
import { format } from 'date-fns'
import type { PlayerStatsAnalysis } from '@/types/lineup'

// Fields available from gamechanger_batting_season view
interface BattingStats {
  pa: number
  ab: number
  h: number
  avg: number
  obp: number
  slg: number
  k_rate: number
  bb_rate: number
  sb: number
  cs: number
}

// Fields available from gamechanger_fielding_season view
interface FieldingStats {
  tc: number
  po: number
  a: number
  fpct: number
  e: number
  dp: number
}

interface PlayerWithStats {
  id: string
  name: string
  jersey_number: number | null
  stats_analysis: PlayerStatsAnalysis | null
  stats_analyzed_at: string | null
  batting: BattingStats | null
  fielding: FieldingStats | null
  has_stats: boolean
}

interface StatsClientProps {
  teamId: string
  players: PlayerWithStats[]
  statsCount: number
  lastImportDate: string | null
}

export function StatsClient({
  teamId,
  players,
  statsCount,
  lastImportDate,
}: StatsClientProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importSectionOpen, setImportSectionOpen] = useState(statsCount === 0)
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setMatchResults(null)
      setError(null)
    } else {
      setError('Please drop a CSV file')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setMatchResults(null)
      setError(null)
    }
  }, [])

  const handleParseFile = async () => {
    if (!file) return

    setParsing(true)
    setError(null)

    try {
      const text = await file.text()
      const parsedStats = parseGameChangerCSV(text)

      if (parsedStats.length === 0) {
        setError('No player data found in the CSV file')
        setParsing(false)
        return
      }

      const results = matchPlayers(parsedStats, players)
      setMatchResults(results)
    } catch (err) {
      console.error('Parse error:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file')
    } finally {
      setParsing(false)
    }
  }

  const handleGenerateAnalysis = async () => {
    setAnalyzing(true)

    try {
      const response = await fetch('/api/stats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate analysis')
      }

      const data = await response.json()

      toast({
        title: 'Analysis complete',
        description: `Generated analysis for ${data.analyzed_count} players.`,
      })

      router.refresh()
    } catch (err) {
      console.error('Analysis error:', err)
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Failed to generate analysis',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleImport = async () => {
    if (!matchResults) return

    const matchedResults = matchResults.filter(r => r.player_id !== null)
    if (matchedResults.length === 0) {
      toast({
        title: 'No matches',
        description: 'No players could be matched. Add players to your roster first.',
        variant: 'destructive',
      })
      return
    }

    setImporting(true)

    try {
      const response = await fetch('/api/import/gamechanger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          stats: matchedResults.map(r => ({
            player_id: r.player_id,
            batting: r.parsed.batting,
            fielding: r.parsed.fielding,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to import stats')
      }

      const data = await response.json()

      toast({
        title: 'Import successful',
        description: `Imported stats for ${data.imported_count} players. Generating analysis...`,
      })

      // Reset state
      setFile(null)
      setMatchResults(null)
      setImportSectionOpen(false)

      // Refresh to get new stats
      router.refresh()

      // Auto-generate analysis after import
      setTimeout(() => {
        handleGenerateAnalysis()
      }, 500)

    } catch (err) {
      console.error('Import error:', err)
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'Failed to import stats',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClearStats = async () => {
    if (!confirm('Are you sure you want to clear all imported stats? This cannot be undone.')) {
      return
    }

    setClearing(true)

    try {
      const response = await fetch('/api/import/gamechanger', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to clear stats')
      }

      toast({
        title: 'Stats cleared',
        description: 'All imported statistics have been removed.',
      })

      router.refresh()
    } catch (err) {
      console.error('Clear error:', err)
      toast({
        title: 'Clear failed',
        description: err instanceof Error ? err.message : 'Failed to clear stats',
        variant: 'destructive',
      })
    } finally {
      setClearing(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setMatchResults(null)
    setError(null)
  }

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev)
      if (next.has(playerId)) {
        next.delete(playerId)
      } else {
        next.add(playerId)
      }
      return next
    })
  }

  const matchedCount = matchResults?.filter(r => r.player_id !== null).length ?? 0
  const unmatchedCount = matchResults?.filter(r => r.player_id === null).length ?? 0
  const playersWithAnalysis = players.filter(p => p.stats_analysis !== null).length

  return (
    <div className="space-y-6">
      {/* Stats Summary & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              <strong>{statsCount}</strong> of {players.length} players have stats
            </span>
          </div>
          {lastImportDate && (
            <span className="text-sm text-muted-foreground">
              Last import: {format(new Date(lastImportDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setImportSectionOpen(true)
              // Scroll to import section
              setTimeout(() => {
                document.getElementById('import-section')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <Button
            onClick={handleGenerateAnalysis}
            disabled={analyzing || statsCount === 0}
            variant="default"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* No Stats Alert */}
      {statsCount === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No stats imported</AlertTitle>
          <AlertDescription>
            Upload a GameChanger CSV file to import player statistics and generate AI analysis.
          </AlertDescription>
        </Alert>
      )}

      {/* Player Analysis Cards */}
      {players.length > 0 && (
        <div className="space-y-3">
          {players.map(player => (
            <Card key={player.id} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => togglePlayerExpanded(player.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {player.jersey_number ?? '-'}
                  </span>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {player.has_stats ? (
                        <>
                          {player.batting && (
                            <span className="text-xs text-muted-foreground">
                              .{(player.batting.avg * 1000).toFixed(0).padStart(3, '0')} AVG
                              {' · '}
                              .{(player.batting.obp * 1000).toFixed(0).padStart(3, '0')} OBP
                              {' · '}
                              {player.batting.h} H
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No stats</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {player.stats_analysis && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Analyzed
                    </Badge>
                  )}
                  {expandedPlayers.has(player.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedPlayers.has(player.id) && (
                <CardContent className="border-t pt-4 space-y-4">
                  {/* Stats Display */}
                  {player.has_stats && player.batting && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Batting Stats</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
                        <StatBox label="AVG" value={player.batting.avg?.toFixed(3) ?? '-'} />
                        <StatBox label="OBP" value={player.batting.obp?.toFixed(3) ?? '-'} />
                        <StatBox label="SLG" value={player.batting.slg?.toFixed(3) ?? '-'} />
                        <StatBox label="H" value={player.batting.h ?? '-'} />
                        <StatBox label="AB" value={player.batting.ab ?? '-'} />
                        <StatBox label="PA" value={player.batting.pa ?? '-'} />
                        <StatBox label="K%" value={player.batting.k_rate ? (player.batting.k_rate * 100).toFixed(0) + '%' : '-'} />
                        <StatBox label="BB%" value={player.batting.bb_rate ? (player.batting.bb_rate * 100).toFixed(0) + '%' : '-'} />
                        <StatBox label="SB" value={player.batting.sb ?? '-'} />
                        <StatBox label="CS" value={player.batting.cs ?? '-'} />
                      </div>
                    </div>
                  )}

                  {player.has_stats && player.fielding && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Fielding Stats</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        <StatBox label="FPCT" value={player.fielding.fpct?.toFixed(3) ?? '-'} />
                        <StatBox label="TC" value={player.fielding.tc ?? '-'} />
                        <StatBox label="PO" value={player.fielding.po ?? '-'} />
                        <StatBox label="A" value={player.fielding.a ?? '-'} />
                        <StatBox label="E" value={player.fielding.e ?? '-'} />
                        <StatBox label="DP" value={player.fielding.dp ?? '-'} />
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {player.stats_analysis ? (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-medium">AI Analysis</h4>
                        {player.stats_analyzed_at && (
                          <span className="text-xs text-muted-foreground">
                            ({format(new Date(player.stats_analyzed_at), 'MMM d, yyyy')})
                          </span>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {player.stats_analysis.summary}
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium flex items-center gap-1.5 text-green-700">
                            <TrendingUp className="h-4 w-4" />
                            Strengths
                          </h5>
                          <div className="space-y-2">
                            {player.stats_analysis.strengths.map((strength, idx) => (
                              <div key={idx} className="text-sm p-2 bg-green-50 rounded-lg border border-green-100">
                                <p className="font-medium text-green-800">{strength.category}</p>
                                <p className="text-green-700">{strength.description}</p>
                                <p className="text-xs text-green-600 mt-1">{strength.supporting_stats}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium flex items-center gap-1.5 text-amber-700">
                            <TrendingDown className="h-4 w-4" />
                            Areas for Improvement
                          </h5>
                          <div className="space-y-2">
                            {player.stats_analysis.weaknesses.map((weakness, idx) => (
                              <div key={idx} className="text-sm p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="font-medium text-amber-800">{weakness.category}</p>
                                <p className="text-amber-700">{weakness.description}</p>
                                <p className="text-xs text-amber-600 mt-1">{weakness.supporting_stats}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="outline">
                          Batting: {player.stats_analysis.recommended_batting_position}
                        </Badge>
                        <Badge variant="outline">
                          Defense: {player.stats_analysis.recommended_defensive_positions.join(', ')}
                        </Badge>
                      </div>
                    </div>
                  ) : player.has_stats ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      <Sparkles className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      <p>No analysis yet. Click "Generate Analysis" to analyze this player.</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      <p>Import stats to enable AI analysis for this player.</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Import Section (Collapsible) */}
      <Collapsible open={importSectionOpen} onOpenChange={setImportSectionOpen}>
        <Card id="import-section">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Import GameChanger Stats</CardTitle>
                  <CardDescription>
                    Upload a CSV file exported from GameChanger
                  </CardDescription>
                </div>
                {importSectionOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {players.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No players</AlertTitle>
                  <AlertDescription>
                    Add players to your roster before importing stats.
                  </AlertDescription>
                </Alert>
              ) : !matchResults ? (
                <>
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Drop CSV file here or click to browse
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {file && (
                    <div className="flex gap-2">
                      <Button onClick={handleParseFile} disabled={parsing}>
                        {parsing ? 'Parsing...' : 'Preview Import'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Preview Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        Preview ({matchResults.length} players found)
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          {matchedCount} matched
                        </span>
                        {unmatchedCount > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            {unmatchedCount} unmatched
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">AVG</TableHead>
                            <TableHead className="text-right">OBP</TableHead>
                            <TableHead className="text-right">H</TableHead>
                            <TableHead className="text-right">RBI</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matchResults.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono">
                                {result.parsed.jersey_number}
                              </TableCell>
                              <TableCell>
                                {result.parsed.first_name} {result.parsed.last_name}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {result.parsed.batting.avg.toFixed(3)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {result.parsed.batting.obp.toFixed(3)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {result.parsed.batting.h}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {result.parsed.batting.rbi}
                              </TableCell>
                              <TableCell>
                                {result.player_id ? (
                                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                    <Check className="h-3 w-3" />
                                    {result.matched_by === 'jersey_number' ? 'Matched by #' : 'Matched by name'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                                    <X className="h-3 w-3" />
                                    No match
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {unmatchedCount > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Some players not matched</AlertTitle>
                      <AlertDescription>
                        {unmatchedCount} player(s) could not be matched to your roster.
                        Make sure jersey numbers match or add missing players.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleImport}
                      disabled={importing || matchedCount === 0}
                    >
                      {importing ? 'Importing...' : `Import ${matchedCount} Players`}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {/* Clear Stats Button */}
              {statsCount > 0 && (
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearStats}
                    disabled={clearing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {clearing ? 'Clearing...' : 'Clear All Stats'}
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center p-2 bg-muted/50 rounded">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono font-medium">{value}</p>
    </div>
  )
}
