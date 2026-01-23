'use client'

import { useMemo, useState, useRef, useEffect, useId } from 'react'
import * as ReactDOM from 'react-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Lock, ChevronDown, MessageSquare, ChevronUp, GripVertical } from 'lucide-react'
import type { BattingOrderEntry, GridCell, Position, DefensiveInning } from '@/types/lineup'

const POSITIONS: (Position | 'SIT')[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SIT']

interface LineupGridProps {
  battingOrder: BattingOrderEntry[]
  innings: number
  grid: GridCell[][]
  onCellChange: (playerId: string, inning: number, position: Position | 'SIT' | null) => void
  onLockCell: (playerId: string, inning: number, locked: boolean) => void
  onLockInning?: (inning: number, locked: boolean) => void
  onBattingOrderChange?: (newOrder: BattingOrderEntry[]) => void
  lockedInnings?: Set<number>
  readOnly?: boolean
  defensiveRationale?: DefensiveInning[]
}

interface PositionDropdownProps {
  currentPosition: Position | 'SIT' | null
  usedPositions: Set<string>
  onSelect: (position: Position | 'SIT' | null) => void
  onClose: () => void
  triggerRect: DOMRect | null
}

function PositionDropdown({
  currentPosition,
  usedPositions,
  onSelect,
  onClose,
  triggerRect,
}: PositionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!triggerRect) return

    // Calculate position - dropdown height is approximately 320px (11 items * ~28px + padding)
    const dropdownHeight = 320
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - triggerRect.bottom

    let top: number
    if (spaceBelow < dropdownHeight + 10) {
      // Open upward - position above the trigger
      top = triggerRect.top - dropdownHeight
      // Make sure it doesn't go above the viewport
      if (top < 10) top = 10
    } else {
      // Open downward - position below the trigger
      top = triggerRect.bottom + 4
    }

    setPosition({
      top,
      left: triggerRect.left,
    })
  }, [triggerRect])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    // Use setTimeout to ensure click handlers fire first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [onClose])

  const handleSelect = (pos: Position | 'SIT' | null) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(pos)
    setTimeout(() => onClose(), 0)
  }

  if (!position) return null

  return ReactDOM.createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="bg-background border rounded-lg shadow-lg p-1 w-[80px]"
      onClick={(e) => e.stopPropagation()}
    >
      {POSITIONS.map((pos) => {
        const isUsed = pos !== 'SIT' && usedPositions.has(pos)
        const isCurrent = pos === currentPosition

        return (
          <button
            key={pos}
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleSelect(pos)}
            className={cn(
              'w-full px-2 py-1 text-left text-sm rounded hover:bg-accent',
              isCurrent && 'bg-accent font-medium',
              isUsed && !isCurrent && 'text-amber-600'
            )}
          >
            {pos}
            {isUsed && !isCurrent && ' ↔'}
          </button>
        )
      })}
      <div className="border-t my-1" />
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleSelect(null)}
        className="w-full px-2 py-1 text-left text-sm rounded hover:bg-accent text-muted-foreground"
      >
        Clear
      </button>
    </div>,
    document.body
  )
}

// Sortable table row component for desktop view
interface SortableRowProps {
  entry: BattingOrderEntry
  inningNumbers: number[]
  getCell: (playerId: string, inning: number) => GridCell | undefined
  activeDropdown: { playerId: string; inning: number; triggerRect: DOMRect } | null
  usedPositionsByInning: Map<number, Set<string>>
  lockedInnings: Set<number>
  readOnly: boolean
  onCellClick: (playerId: string, inning: number, element: HTMLElement) => void
  onCellChange: (playerId: string, inning: number, position: Position | 'SIT' | null) => void
  onLockToggle: (playerId: string, inning: number, e: React.MouseEvent) => void
  setActiveDropdown: (dropdown: { playerId: string; inning: number; triggerRect: DOMRect } | null) => void
  isDraggable: boolean
}

function SortableRow({
  entry,
  inningNumbers,
  getCell,
  activeDropdown,
  usedPositionsByInning,
  lockedInnings,
  readOnly,
  onCellClick,
  onCellChange,
  onLockToggle,
  setActiveDropdown,
  isDraggable,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.player_id, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn('border-b hover:bg-muted/50', isDragging && 'bg-muted/50')}
    >
      <td className="p-2">
        <div className="flex items-center gap-2">
          {isDraggable && (
            <button
              type="button"
              className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
            {entry.order}
          </span>
          <span className="font-medium">{entry.name}</span>
        </div>
      </td>
      {inningNumbers.map(inning => {
        const cell = getCell(entry.player_id, inning)
        const isActive = activeDropdown?.playerId === entry.player_id && activeDropdown?.inning === inning
        const usedPositions = usedPositionsByInning.get(inning) || new Set()
        const isInningLocked = lockedInnings.has(inning)

        return (
          <td key={inning} className={cn('text-center p-1', isInningLocked && 'bg-primary/5')}>
            <div
              onClick={(e) => onCellClick(entry.player_id, inning, e.currentTarget)}
              className={cn(
                'relative flex items-center justify-center gap-1 px-2 py-1.5 rounded min-h-[36px]',
                cell?.locked && 'ring-2 ring-primary/50 bg-primary/5',
                !cell?.position && !isInningLocked && 'border border-dashed border-muted-foreground/30',
                !cell?.position && isInningLocked && 'border border-dashed border-primary/30',
                cell?.position && !cell?.locked && !isInningLocked && 'bg-secondary',
                cell?.position && isInningLocked && 'bg-primary/10',
                !readOnly && !isInningLocked && 'cursor-pointer hover:bg-accent',
                isInningLocked && 'cursor-not-allowed'
              )}
            >
              {cell?.position ? (
                <>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      cell.position === 'SIT'
                        ? 'text-muted-foreground'
                        : cell.position === 'P' || cell.position === 'C' || cell.position === 'SS' || cell.position === '1B'
                        ? 'text-primary'
                        : 'text-secondary-foreground'
                    )}
                  >
                    {cell.position}
                  </span>
                  {cell.locked && (
                    <Lock
                      className="h-3 w-3 text-primary cursor-pointer hover:text-primary/70"
                      onClick={(e) => onLockToggle(entry.player_id, inning, e)}
                    />
                  )}
                  {!cell.locked && !readOnly && (
                    <button
                      onClick={(e) => onLockToggle(entry.player_id, inning, e)}
                      className="opacity-0 hover:opacity-100 absolute right-1 top-1"
                      title="Lock this position"
                    >
                      <Lock className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </button>
                  )}
                </>
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            {isActive && (
              <PositionDropdown
                currentPosition={cell?.position || null}
                usedPositions={usedPositions}
                onSelect={(pos) => onCellChange(entry.player_id, inning, pos)}
                onClose={() => setActiveDropdown(null)}
                triggerRect={activeDropdown?.triggerRect || null}
              />
            )}
          </td>
        )
      })}
    </tr>
  )
}

// Sortable card component for mobile view
interface SortableCardProps {
  entry: BattingOrderEntry
  inningNumbers: number[]
  getCell: (playerId: string, inning: number) => GridCell | undefined
  activeDropdown: { playerId: string; inning: number; triggerRect: DOMRect } | null
  usedPositionsByInning: Map<number, Set<string>>
  lockedInnings: Set<number>
  hasDefensivePositions: boolean
  readOnly: boolean
  onCellClick: (playerId: string, inning: number, element: HTMLElement) => void
  onCellChange: (playerId: string, inning: number, position: Position | 'SIT' | null) => void
  onInningHeaderClick: (inning: number) => void
  setActiveDropdown: (dropdown: { playerId: string; inning: number; triggerRect: DOMRect } | null) => void
  isDraggable: boolean
}

function SortableCard({
  entry,
  inningNumbers,
  getCell,
  activeDropdown,
  usedPositionsByInning,
  lockedInnings,
  hasDefensivePositions,
  readOnly,
  onCellClick,
  onCellChange,
  onInningHeaderClick,
  setActiveDropdown,
  isDraggable,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.player_id, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('border rounded-lg p-3', isDragging && 'bg-muted/50 border-primary/50')}
    >
      <div className="flex items-center gap-2 mb-3">
        {isDraggable && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {entry.order}
        </span>
        <span className="font-medium">{entry.name}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {inningNumbers.map(inning => {
          const cell = getCell(entry.player_id, inning)
          const isActive = activeDropdown?.playerId === entry.player_id && activeDropdown?.inning === inning
          const usedPositions = usedPositionsByInning.get(inning) || new Set()
          const isInningLocked = lockedInnings.has(inning)

          return (
            <div key={inning} className="text-center">
              <div
                className={cn(
                  'text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-0.5',
                  hasDefensivePositions && 'cursor-pointer',
                  isInningLocked && 'text-primary font-medium'
                )}
                onClick={() => onInningHeaderClick(inning)}
              >
                {inning}
                {isInningLocked && <Lock className="h-2 w-2" />}
              </div>
              <div
                onClick={(e) => onCellClick(entry.player_id, inning, e.currentTarget)}
                className={cn(
                  'relative flex items-center justify-center gap-0.5 px-2 py-1 rounded min-w-[40px]',
                  cell?.locked && 'ring-2 ring-primary/50 bg-primary/5',
                  !cell?.position && !isInningLocked && 'border border-dashed border-muted-foreground/30',
                  !cell?.position && isInningLocked && 'border border-dashed border-primary/30 bg-primary/5',
                  cell?.position && !cell?.locked && !isInningLocked && 'bg-secondary',
                  cell?.position && isInningLocked && 'bg-primary/10',
                  !readOnly && !isInningLocked && 'cursor-pointer hover:bg-accent',
                  isInningLocked && 'cursor-not-allowed'
                )}
              >
                {cell?.position ? (
                  <>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        cell.position === 'SIT'
                          ? 'text-muted-foreground'
                          : cell.position === 'P' || cell.position === 'C' || cell.position === 'SS' || cell.position === '1B'
                          ? 'text-primary'
                          : 'text-secondary-foreground'
                      )}
                    >
                      {cell.position}
                    </span>
                    {cell.locked && <Lock className="h-2.5 w-2.5 text-primary" />}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
              {isActive && (
                <PositionDropdown
                  currentPosition={cell?.position || null}
                  usedPositions={usedPositions}
                  onSelect={(pos) => onCellChange(entry.player_id, inning, pos)}
                  onClose={() => setActiveDropdown(null)}
                  triggerRect={activeDropdown?.triggerRect || null}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LineupGrid({
  battingOrder,
  innings,
  grid,
  onCellChange,
  onLockCell,
  onLockInning,
  onBattingOrderChange,
  lockedInnings = new Set(),
  readOnly = false,
  defensiveRationale,
}: LineupGridProps) {
  const [activeDropdown, setActiveDropdown] = useState<{ playerId: string; inning: number; triggerRect: DOMRect } | null>(null)
  const [showRationale, setShowRationale] = useState(false)

  // Stable ID for DndContext to prevent hydration mismatch
  const dndContextId = useId()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && onBattingOrderChange) {
      const oldIndex = battingOrder.findIndex((entry) => entry.player_id === active.id)
      const newIndex = battingOrder.findIndex((entry) => entry.player_id === over.id)

      const newOrder = arrayMove(battingOrder, oldIndex, newIndex).map((entry, index) => ({
        ...entry,
        order: index + 1,
      }))

      onBattingOrderChange(newOrder)
    }
  }

  const isDraggable = !readOnly && !!onBattingOrderChange

  // Check if grid has any positions filled (defensive generation completed)
  const hasDefensivePositions = grid.some(row => row.some(cell => cell.position !== null))

  // Check if any innings have reasoning
  const hasRationale = defensiveRationale && defensiveRationale.some(inning => inning.reasoning)

  // Build a map of used positions per inning
  const usedPositionsByInning = useMemo(() => {
    const map = new Map<number, Set<string>>()
    for (let i = 1; i <= innings; i++) {
      const positions = new Set<string>()
      grid.forEach(playerRow => {
        const cell = playerRow.find(c => c.inning === i)
        if (cell?.position && cell.position !== 'SIT') {
          positions.add(cell.position)
        }
      })
      map.set(i, positions)
    }
    return map
  }, [grid, innings])

  const inningNumbers = Array.from({ length: innings }, (_, i) => i + 1)

  // Get cell for a player and inning
  const getCell = (playerId: string, inning: number): GridCell | undefined => {
    const playerRow = grid.find(row => row[0]?.playerId === playerId)
    return playerRow?.find(cell => cell.inning === inning)
  }

  const handleCellClick = (playerId: string, inning: number, element: HTMLElement) => {
    if (readOnly) return
    // Don't allow editing locked innings
    if (lockedInnings.has(inning)) return
    // Toggle dropdown - if clicking on same cell, close it; otherwise open new one
    setActiveDropdown(prev => {
      if (prev?.playerId === playerId && prev?.inning === inning) {
        return null
      }
      return { playerId, inning, triggerRect: element.getBoundingClientRect() }
    })
  }

  const handleInningHeaderClick = (inning: number) => {
    if (!onLockInning || !hasDefensivePositions) return
    const isLocked = lockedInnings.has(inning)
    onLockInning(inning, !isLocked)
  }

  const handleLockToggle = (playerId: string, inning: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const cell = getCell(playerId, inning)
    if (cell) {
      onLockCell(playerId, inning, !cell.locked)
    }
  }

  const playerIds = battingOrder.map(entry => entry.player_id)

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Desktop Grid View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium min-w-[140px]">Player</th>
                {inningNumbers.map(inning => {
                  const isLocked = lockedInnings.has(inning)
                  return (
                    <th
                      key={inning}
                      className={cn(
                        'text-center p-2 font-medium min-w-[60px]',
                        hasDefensivePositions && 'cursor-pointer hover:bg-muted/50',
                        isLocked && 'bg-primary/10'
                      )}
                      onClick={() => handleInningHeaderClick(inning)}
                      title={hasDefensivePositions ? (isLocked ? 'Click to unlock inning' : 'Click to lock inning') : undefined}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {inning}
                        {isLocked && <Lock className="h-3 w-3 text-primary" />}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
              <tbody>
                {battingOrder.map((entry, index) => (
                  <SortableRow
                    key={entry.player_id || `row-${index}`}
                    entry={entry}
                    inningNumbers={inningNumbers}
                    getCell={getCell}
                    activeDropdown={activeDropdown}
                    usedPositionsByInning={usedPositionsByInning}
                    lockedInnings={lockedInnings}
                    readOnly={readOnly}
                    onCellClick={handleCellClick}
                    onCellChange={onCellChange}
                    onLockToggle={handleLockToggle}
                    setActiveDropdown={setActiveDropdown}
                    isDraggable={isDraggable}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>

        {/* Mobile Card View */}
        <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
          <div className="md:hidden space-y-3">
            {battingOrder.map((entry, index) => (
              <SortableCard
                key={entry.player_id || `card-${index}`}
                entry={entry}
                inningNumbers={inningNumbers}
                getCell={getCell}
                activeDropdown={activeDropdown}
                usedPositionsByInning={usedPositionsByInning}
                lockedInnings={lockedInnings}
                hasDefensivePositions={hasDefensivePositions}
                readOnly={readOnly}
                onCellClick={handleCellClick}
                onCellChange={onCellChange}
                onInningHeaderClick={handleInningHeaderClick}
                setActiveDropdown={setActiveDropdown}
                isDraggable={isDraggable}
              />
            ))}
          </div>
        </SortableContext>

      {/* Rationale Section */}
      {hasRationale && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowRationale(!showRationale)}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Defensive Assignment Rationale
            </span>
            {showRationale ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showRationale && defensiveRationale && (
            <div className="mt-3 space-y-3">
              {defensiveRationale.map((inning) => (
                inning.reasoning && (
                  <div key={inning.inning} className="text-sm">
                    <span className="font-medium">Inning {inning.inning}:</span>{' '}
                    <span className="text-muted-foreground">{inning.reasoning}</span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        {isDraggable && (
          <div className="flex items-center gap-1">
            <GripVertical className="h-3 w-3" />
            <span>= Drag to reorder</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          <span>= Locked</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">P</span>
          <span>= Premium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">SIT</span>
          <span>= Sitting</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-600">↔</span>
          <span>= Swap</span>
        </div>
        {hasDefensivePositions && (
          <div className="flex items-center gap-1 ml-auto text-muted-foreground/70">
            <span>Click inning header to lock/unlock</span>
          </div>
        )}
      </div>
      </div>
    </DndContext>
  )
}
