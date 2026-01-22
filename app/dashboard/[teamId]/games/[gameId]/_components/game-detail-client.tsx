'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useToast } from '@/lib/hooks/use-toast'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { RosterSetup } from './roster-setup'
import { LineupGrid } from './lineup-grid'
import { InGameAdjustments } from './in-game-adjustments'
import { RuleCompliance } from './rule-compliance'
import type { Database } from '@/types/database'
import type {
  BattingOrderEntry,
  DefensiveInning,
  GridCell,
  LockedPosition,
  Position,
  RuleCheck,
  POSITIONS,
} from '@/types/lineup'

type Game = Database['public']['Tables']['games']['Row']
type Player = Database['public']['Tables']['players']['Row']
type GameRoster = Database['public']['Tables']['game_roster']['Row']
type Lineup = Database['public']['Tables']['lineups']['Row']
type RuleGroup = Database['public']['Tables']['rule_groups']['Row']

type Phase = 'setup' | 'batting' | 'defense' | 'complete'

interface GameDetailClientProps {
  game: Game
  players: Player[]
  gameRoster: GameRoster[]
  existingLineup: Lineup | null
  ruleGroups: RuleGroup[]
}

export function GameDetailClient({
  game,
  players,
  gameRoster: initialGameRoster,
  existingLineup: initialLineup,
  ruleGroups,
}: GameDetailClientProps) {
  const [gameRoster, setGameRoster] = useState<GameRoster[]>(initialGameRoster)
  const [lineup, setLineup] = useState<Lineup | null>(initialLineup)

  // Phase state
  const initialPhase = useMemo(() => {
    if (!initialLineup) return 'setup'
    // Check if defensive_grid has actual content (not empty array)
    const defenseGrid = initialLineup.defensive_grid as unknown as DefensiveInning[] | null
    if (defenseGrid && Array.isArray(defenseGrid) && defenseGrid.length > 0) return 'complete'
    if (initialLineup.batting_order) return 'defense'
    return 'setup'
  }, [initialLineup])
  const [phase, setPhase] = useState<Phase>(initialPhase)

  // Batting order state
  // recommendedBattingOrder = original AI recommendation (never changes after generation)
  // battingOrder = actual order being used (can be modified by drag and drop)
  const [recommendedBattingOrder, setRecommendedBattingOrder] = useState<BattingOrderEntry[] | null>(
    initialLineup?.batting_order as BattingOrderEntry[] | null
  )
  const [battingOrder, setBattingOrder] = useState<BattingOrderEntry[] | null>(
    initialLineup?.batting_order as BattingOrderEntry[] | null
  )
  const [battingRationale, setBattingRationale] = useState<string | null>(
    initialLineup?.ai_reasoning as string | null
  )

  // Defensive grid state
  const [defensiveRationale, setDefensiveRationale] = useState<DefensiveInning[] | null>(() => {
    const defenseGrid = initialLineup?.defensive_grid as unknown as DefensiveInning[] | null
    return defenseGrid && Array.isArray(defenseGrid) && defenseGrid.length > 0 ? defenseGrid : null
  })
  const [rulesCheck, setRulesCheck] = useState<RuleCheck[] | null>(
    initialLineup?.rules_check as RuleCheck[] | null
  )
  const [warnings, setWarnings] = useState<string[] | null>(
    initialLineup?.warnings as string[] | null
  )

  // Grid cell state - use initialLineup directly to avoid state timing issues
  const [grid, setGrid] = useState<GridCell[][]>(() => {
    const battingOrderData = initialLineup?.batting_order as unknown as BattingOrderEntry[] | null
    const defenseGrid = initialLineup?.defensive_grid as unknown as DefensiveInning[] | null

    if (battingOrderData && Array.isArray(battingOrderData) && battingOrderData.length > 0) {
      if (defenseGrid && Array.isArray(defenseGrid) && defenseGrid.length > 0) {
        return buildGridFromDefense(battingOrderData, defenseGrid, game.innings ?? 6)
      }
      // If we have batting order but no defense grid, initialize empty grid
      return initializeGrid(battingOrderData, game.innings ?? 6)
    }
    return []
  })
  const [lockedPositions, setLockedPositions] = useState<LockedPosition[]>([])
  const [lockedInnings, setLockedInnings] = useState<Set<number>>(new Set())

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRuleGroupId, setSelectedRuleGroupId] = useState<string | null>(
    ruleGroups.length > 0 ? ruleGroups[0].id : null
  )
  const [battingNotes, setBattingNotes] = useState('')
  const [defensiveNotes, setDefensiveNotes] = useState('')
  const [innings, setInnings] = useState(game.innings ?? 6)

  // UI state - collapse sections by default when lineup is complete
  const [showBattingRationale, setShowBattingRationale] = useState(false)
  const [showGameDetails, setShowGameDetails] = useState(initialPhase === 'setup')
  const [showAvailablePlayers, setShowAvailablePlayers] = useState(initialPhase === 'setup')
  const [showBattingOrderSection, setShowBattingOrderSection] = useState(initialPhase !== 'complete')

  const { toast } = useToast()
  const supabase = createClient()

  const gameDate = parseISO(game.game_date)
  const isUpcoming = game.game_date >= new Date().toISOString().split('T')[0]

  // Calculate available players
  const availablePlayers = useMemo(() => {
    return players.filter(player => {
      const entry = gameRoster.find(r => r.player_id === player.id)
      return entry?.available ?? true
    })
  }, [players, gameRoster])

  const availablePlayerIds = useMemo(() => availablePlayers.map(p => p.id), [availablePlayers])

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusBadge = () => {
    switch (game.status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>
      default:
        return <Badge variant="outline">Scheduled</Badge>
    }
  }

  // Roster update handler
  const handleRosterUpdate = async (
    playerId: string,
    updates: { available?: boolean; restrictions?: string | null }
  ) => {
    const existingEntry = gameRoster.find(r => r.player_id === playerId)

    if (existingEntry) {
      const { error } = await supabase
        .from('game_roster')
        .update(updates)
        .eq('id', existingEntry.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update roster.',
          variant: 'destructive',
        })
        return
      }

      setGameRoster(
        gameRoster.map(r =>
          r.id === existingEntry.id ? { ...r, ...updates } : r
        )
      )
    } else {
      const { data: newEntry, error } = await supabase
        .from('game_roster')
        .insert({
          game_id: game.id,
          player_id: playerId,
          available: updates.available ?? true,
          pitching_innings_available: 0,
          restrictions: updates.restrictions ?? null,
        })
        .select()
        .single()

      if (error || !newEntry) {
        toast({
          title: 'Error',
          description: 'Failed to update roster.',
          variant: 'destructive',
        })
        return
      }

      setGameRoster([...gameRoster, newEntry])
    }
  }

  // Generate batting order (Phase 1)
  const handleGenerateBattingOrder = async () => {
    if (availablePlayers.length < 9) {
      toast({
        title: 'Not Enough Players',
        description: 'You need at least 9 available players to generate a lineup.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-lineup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          rule_group_id: selectedRuleGroupId,
          additional_notes: battingNotes.trim() || null,
          phase: 'batting_order',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate batting order')
      }

      setRecommendedBattingOrder(data.batting_order)
      setBattingOrder(data.batting_order)
      setBattingRationale(data.rationale)
      setLineup(data.lineup)

      // Initialize empty grid
      const newGrid = initializeGrid(data.batting_order, innings)
      setGrid(newGrid)
      setLockedPositions([])

      setPhase('defense')

      toast({
        title: 'Batting Order Generated',
        description: 'Now you can lock defensive positions before filling the rest.',
      })
    } catch (error) {
      console.error('Batting order generation error:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate batting order',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Fill defensive positions (Phase 2)
  const handleFillDefensive = async (startFromInning: number = 1) => {
    if (!battingOrder) {
      toast({
        title: 'No Batting Order',
        description: 'Generate a batting order first.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-lineup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          rule_group_id: selectedRuleGroupId,
          additional_notes: defensiveNotes.trim() || null,
          phase: 'defensive',
          batting_order: battingOrder,
          locked_positions: lockedPositions,
          start_from_inning: startFromInning,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate defensive positions')
      }

      setDefensiveRationale(data.defense)
      setRulesCheck(data.rules_check)
      setWarnings(data.warnings)
      setLineup(data.lineup)

      // Update grid from defensive response
      const newGrid = buildGridFromDefense(battingOrder, data.defense, innings)
      // Preserve locked positions
      lockedPositions.forEach(lp => {
        const playerIndex = battingOrder.findIndex(b => b.player_id === lp.playerId)
        if (playerIndex >= 0) {
          const cell = newGrid[playerIndex]?.find(c => c.inning === lp.inning)
          if (cell) {
            cell.locked = true
          }
        }
      })
      setGrid(newGrid)

      setPhase('complete')

      toast({
        title: 'Lineup Complete',
        description: 'Defensive positions have been filled.',
      })
    } catch (error) {
      console.error('Defensive generation error:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to fill defensive positions',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Grid cell change handler
  const handleCellChange = useCallback((playerId: string, inning: number, position: Position | 'SIT' | null) => {
    setGrid(prevGrid => {
      if (prevGrid.length === 0) {
        return prevGrid
      }

      const newGrid = prevGrid.map(playerRow => {
        return playerRow.map(cell => {
          // Update the target cell
          if (cell.playerId === playerId && cell.inning === inning) {
            return { ...cell, position, locked: position !== null }
          }
          // If assigning a field position (not SIT), remove it from any other player in that inning
          if (position && position !== 'SIT' && cell.inning === inning && cell.position === position) {
            return { ...cell, position: null, locked: false }
          }
          return cell
        })
      })

      return newGrid
    })

    // Update locked positions if this is a manual change
    if (position) {
      setLockedPositions(prev => {
        const existing = prev.find(lp => lp.playerId === playerId && lp.inning === inning)
        if (existing) {
          return prev.map(lp =>
            lp.playerId === playerId && lp.inning === inning
              ? { ...lp, position }
              : lp
          )
        }
        return [...prev, { playerId, inning, position }]
      })
    } else {
      // Remove from locked positions if cleared
      setLockedPositions(prev =>
        prev.filter(lp => !(lp.playerId === playerId && lp.inning === inning))
      )
    }
  }, [])

  // Lock/unlock entire inning handler
  const handleLockInning = useCallback((inning: number, locked: boolean) => {
    setLockedInnings(prev => {
      const newSet = new Set(prev)
      if (locked) {
        newSet.add(inning)
      } else {
        newSet.delete(inning)
      }
      return newSet
    })

    // Also lock/unlock all cells in that inning
    setGrid(prevGrid => {
      return prevGrid.map(playerRow => {
        return playerRow.map(cell => {
          if (cell.inning === inning && cell.position) {
            return { ...cell, locked }
          }
          return cell
        })
      })
    })

    // Update lockedPositions accordingly
    if (locked) {
      // Add all positions from this inning to lockedPositions
      setLockedPositions(prev => {
        const newLocked = [...prev]
        grid.forEach(playerRow => {
          const cell = playerRow.find(c => c.inning === inning)
          if (cell?.position) {
            const existing = newLocked.find(lp => lp.playerId === cell.playerId && lp.inning === inning)
            if (!existing) {
              newLocked.push({ playerId: cell.playerId, inning, position: cell.position })
            }
          }
        })
        return newLocked
      })
    } else {
      // Remove all positions from this inning from lockedPositions
      setLockedPositions(prev => prev.filter(lp => lp.inning !== inning))
    }
  }, [grid])

  // Lock/unlock cell handler
  const handleLockCell = useCallback((playerId: string, inning: number, locked: boolean) => {
    const cell = grid.flat().find(c => c.playerId === playerId && c.inning === inning)
    if (!cell?.position) return

    setGrid(prevGrid => {
      return prevGrid.map(playerRow => {
        return playerRow.map(c => {
          if (c.playerId === playerId && c.inning === inning) {
            return { ...c, locked }
          }
          return c
        })
      })
    })

    if (locked && cell.position) {
      setLockedPositions(prev => {
        const existing = prev.find(lp => lp.playerId === playerId && lp.inning === inning)
        if (existing) return prev
        return [...prev, { playerId, inning, position: cell.position! }]
      })
    } else {
      setLockedPositions(prev =>
        prev.filter(lp => !(lp.playerId === playerId && lp.inning === inning))
      )
    }
  }, [grid])

  // Innings change handler
  const handleInningsChange = useCallback((newInnings: number) => {
    setInnings(newInnings)
    if (battingOrder) {
      // Resize grid
      const newGrid = grid.map(playerRow => {
        const existingCells = playerRow.slice(0, newInnings)
        const newCells = Array.from({ length: Math.max(0, newInnings - playerRow.length) }, (_, i) => ({
          playerId: playerRow[0]?.playerId || '',
          inning: playerRow.length + i + 1,
          position: null,
          locked: false,
        }))
        return [...existingCells, ...newCells]
      })
      setGrid(newGrid)
    }
  }, [battingOrder, grid])

  // Mark players unavailable
  const handleMarkUnavailable = useCallback(async (playerIds: string[]) => {
    for (const playerId of playerIds) {
      await handleRosterUpdate(playerId, { available: false })
    }
    toast({
      title: 'Players Updated',
      description: `${playerIds.length} player(s) marked as unavailable.`,
    })
  }, [handleRosterUpdate, toast])

  // Regenerate from inning
  const handleRegenerateFrom = useCallback((startInning: number) => {
    handleFillDefensive(startInning)
  }, [handleFillDefensive])

  // Batting order change handler (drag and drop reorder)
  const handleBattingOrderChange = useCallback((newOrder: BattingOrderEntry[]) => {
    setBattingOrder(newOrder)

    // Reorder the grid to match the new batting order
    setGrid(prevGrid => {
      if (prevGrid.length === 0) return prevGrid

      // Create a map of player rows by player ID
      const playerRowMap = new Map<string, GridCell[]>()
      prevGrid.forEach(row => {
        if (row.length > 0) {
          playerRowMap.set(row[0].playerId, row)
        }
      })

      // Rebuild grid in new order
      return newOrder.map(entry => {
        return playerRowMap.get(entry.player_id) || []
      }).filter(row => row.length > 0)
    })

    // Update locked positions to match new order (no actual change needed, just the reference)
    // The locked positions are by player ID and inning, so they remain valid
  }, [])

  const selectedRuleGroup = ruleGroups.find(g => g.id === selectedRuleGroupId)

  return (
    <div className="space-y-4">
      {/* Header - Compact when lineup complete */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/games">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className={phase === 'complete' ? 'text-2xl font-bold tracking-tight' : 'text-3xl font-bold tracking-tight'}>
              vs {game.opponent || 'TBD'}
            </h1>
            {getStatusBadge()}
          </div>
          {/* Compact inline info when complete */}
          {phase === 'complete' ? (
            <p className="text-sm text-muted-foreground">
              {format(gameDate, 'MMM d')} • {innings} innings • {availablePlayers.length} players
            </p>
          ) : (
            <p className="text-muted-foreground">
              {innings} innings
            </p>
          )}
        </div>
      </div>

      {/* Game Info Card - Collapsible */}
      <Collapsible open={showGameDetails} onOpenChange={setShowGameDetails}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Game Details
                </CardTitle>
                {showGameDetails ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(gameDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              {game.game_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(game.game_time)}</span>
                </div>
              )}
              {game.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{game.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {availablePlayers.length} of {players.length} players available
                </span>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Step 1: Available Players - Collapsible */}
      <Collapsible open={showAvailablePlayers} onOpenChange={setShowAvailablePlayers}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">1</span>
                  <div>
                    <CardTitle className="text-lg">Available Players</CardTitle>
                    {!showAvailablePlayers && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {availablePlayers.length} of {players.length} available
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {phase !== 'setup' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {showAvailablePlayers ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <RosterSetup
                players={players}
                gameRoster={gameRoster}
                onUpdate={handleRosterUpdate}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Step 2: Generate Batting Order - Collapsible */}
      {isUpcoming && game.status !== 'completed' && (
        <Collapsible open={showBattingOrderSection} onOpenChange={setShowBattingOrderSection}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">2</span>
                    <div>
                      <CardTitle className="text-lg">Batting Order</CardTitle>
                      {!showBattingOrderSection && recommendedBattingOrder && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {recommendedBattingOrder.length} batters • {selectedRuleGroup?.name || 'No rule group'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(phase === 'defense' || phase === 'complete') && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {showBattingOrderSection ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Rule Group Selection */}
                  {ruleGroups.length === 0 ? (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">No Rule Groups</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Create a rule group first to define how the AI should generate lineups.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <Link href="/dashboard/rules">Create Rule Group</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {phase === 'setup' && (
                        <>
                          <div className="space-y-2">
                            <Label>Rule Group</Label>
                            <Select
                              value={selectedRuleGroupId || undefined}
                              onValueChange={(value) => setSelectedRuleGroupId(value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select rule group" />
                              </SelectTrigger>
                              <SelectContent>
                                {ruleGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedRuleGroup?.description && (
                              <p className="text-xs text-muted-foreground">
                                {selectedRuleGroup.description}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="batting-notes">Notes for AI</Label>
                            <Textarea
                              id="batting-notes"
                              placeholder="e.g., 'Cole should bat leadoff', 'Strong hitters in 3-4-5'..."
                              value={battingNotes}
                              onChange={(e) => setBattingNotes(e.target.value)}
                              rows={2}
                              className="resize-none"
                            />
                          </div>

                          <Button
                            onClick={handleGenerateBattingOrder}
                            disabled={isGenerating || availablePlayers.length < 9 || !selectedRuleGroupId}
                            className="w-full"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {isGenerating ? 'Generating...' : 'Generate Batting Order'}
                          </Button>
                        </>
                      )}

                      {recommendedBattingOrder && phase !== 'setup' && (
                        <div className="space-y-3">
                          {/* Recommended batting order with insights */}
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">AI Recommended Order</p>
                            <div className="space-y-1.5">
                              {recommendedBattingOrder.map((entry) => (
                                <div
                                  key={entry.player_id}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0 mt-0.5">
                                    {entry.order}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="font-medium">{entry.name}</span>
                                    {entry.reasoning && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {entry.reasoning}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Overall Rationale */}
                          {battingRationale && (
                            <Collapsible open={showBattingRationale} onOpenChange={setShowBattingRationale}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                  <span className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Overall Strategy
                                  </span>
                                  {showBattingRationale ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-2">
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                  {battingRationale}
                                </p>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => {
                              setPhase('setup')
                              setShowBattingOrderSection(true)
                            }}
                            size="sm"
                          >
                            Regenerate Batting Order
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Step 3: Defensive Positions - Main focus during game */}
      {(phase === 'defense' || phase === 'complete') && battingOrder && (
        <Card className={phase === 'complete' ? 'border-primary/20' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">3</span>
                <CardTitle className="text-lg">
                  {phase === 'complete' ? 'Game Lineup' : 'Defensive Positions'}
                </CardTitle>
              </div>
              {phase === 'complete' && (
                <Badge variant="default" className="bg-green-600">Ready</Badge>
              )}
            </div>
            {phase === 'defense' && (
              <CardDescription className="mt-1">
                Lock positions you want to set manually, then let AI fill the rest.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Lineup Grid - Primary content */}
              <LineupGrid
                battingOrder={battingOrder}
                innings={innings}
                grid={grid}
                onCellChange={handleCellChange}
                onLockCell={handleLockCell}
                onLockInning={handleLockInning}
                onBattingOrderChange={handleBattingOrderChange}
                lockedInnings={lockedInnings}
                readOnly={false}
                defensiveRationale={defensiveRationale || undefined}
              />

              {/* Fill button for defense phase */}
              {phase === 'defense' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="defensive-notes">Additional Notes</Label>
                    <Textarea
                      id="defensive-notes"
                      placeholder="e.g., 'Keep outfielders rotating', 'Balance infield time'..."
                      value={defensiveNotes}
                      onChange={(e) => setDefensiveNotes(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    onClick={() => handleFillDefensive(1)}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Filling Positions...' : 'Fill Remaining Positions with AI'}
                  </Button>

                  {lockedPositions.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {lockedPositions.length} position(s) locked — AI will not change these
                    </p>
                  )}
                </div>
              )}

              {/* In-game adjustments for complete phase - Always visible */}
              {phase === 'complete' && (
                <div className="pt-4 border-t">
                  <InGameAdjustments
                    currentInnings={innings}
                    players={players}
                    availablePlayers={availablePlayerIds}
                    onInningsChange={handleInningsChange}
                    onMarkUnavailable={handleMarkUnavailable}
                    onRegenerateFrom={handleRegenerateFrom}
                    isGenerating={isGenerating}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules Compliance - Collapsible, shows warning count when collapsed */}
      {phase === 'complete' && rulesCheck && (
        <Collapsible defaultOpen={!!(warnings && warnings.length > 0)}>
          <Card className={warnings && warnings.length > 0 ? 'border-amber-300' : ''}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {warnings && warnings.length > 0 ? (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    Rules Compliance
                    {warnings && warnings.length > 0 && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <RuleCompliance rulesCheck={rulesCheck} warnings={warnings || []} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Score for completed games */}
      {game.status === 'completed' && game.our_score !== null && game.their_score !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Final Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {game.our_score} - {game.their_score}
              {game.our_score > game.their_score && (
                <span className="text-green-600 ml-3 text-lg">Win</span>
              )}
              {game.our_score < game.their_score && (
                <span className="text-red-600 ml-3 text-lg">Loss</span>
              )}
              {game.our_score === game.their_score && (
                <span className="text-muted-foreground ml-3 text-lg">Tie</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to initialize empty grid
function initializeGrid(battingOrder: BattingOrderEntry[], innings: number): GridCell[][] {
  return battingOrder.map(entry => {
    return Array.from({ length: innings }, (_, i) => ({
      playerId: entry.player_id,
      inning: i + 1,
      position: null,
      locked: false,
    }))
  })
}

// Helper function to build grid from defensive response
function buildGridFromDefense(
  battingOrder: BattingOrderEntry[],
  defense: DefensiveInning[],
  innings: number
): GridCell[][] {
  const POSITIONS_LIST: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']

  return battingOrder.map(entry => {
    return Array.from({ length: innings }, (_, i) => {
      const inning = i + 1
      const defensiveInning = defense.find(d => d.inning === inning)

      if (!defensiveInning) {
        return {
          playerId: entry.player_id,
          inning,
          position: null,
          locked: false,
        }
      }

      // Find player's position in this inning
      for (const pos of POSITIONS_LIST) {
        if (defensiveInning[pos]?.id === entry.player_id) {
          return {
            playerId: entry.player_id,
            inning,
            position: pos,
            locked: false,
          }
        }
      }

      // Check if sitting
      if (defensiveInning.sit?.some(p => p.id === entry.player_id)) {
        return {
          playerId: entry.player_id,
          inning,
          position: 'SIT' as const,
          locked: false,
        }
      }

      return {
        playerId: entry.player_id,
        inning,
        position: null,
        locked: false,
      }
    })
  })
}
