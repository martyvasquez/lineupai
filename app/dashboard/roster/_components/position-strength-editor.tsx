'use client'

import { useState } from 'react'
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { GripVertical, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF'] as const
type Position = typeof ALL_POSITIONS[number]

const POSITION_LABELS: Record<Position, string> = {
  P: 'Pitcher',
  C: 'Catcher',
  '1B': 'First Base',
  '2B': 'Second Base',
  '3B': 'Third Base',
  SS: 'Shortstop',
  LF: 'Left Field',
  CF: 'Center Field',
  RF: 'Right Field',
  OF: 'Outfield (any)',
}

interface SortablePositionProps {
  position: Position
  index: number
  onRemove: () => void
}

function SortablePosition({ position, index, onRemove }: SortablePositionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: position })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 bg-background border rounded-md',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded">
        {index + 1}
      </span>
      <span className="font-medium">{position}</span>
      <span className="text-sm text-muted-foreground flex-1">{POSITION_LABELS[position]}</span>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface PositionStrengthEditorProps {
  positions: string[]
  onChange: (positions: string[]) => void
}

export function PositionStrengthEditor({ positions, onChange }: PositionStrengthEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const availablePositions = ALL_POSITIONS.filter(p => !positions.includes(p))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = positions.indexOf(active.id as string)
      const newIndex = positions.indexOf(over.id as string)
      onChange(arrayMove(positions, oldIndex, newIndex))
    }
  }

  const handleAddPosition = (position: Position) => {
    onChange([...positions, position])
    setShowAddMenu(false)
  }

  const handleRemovePosition = (position: string) => {
    onChange(positions.filter(p => p !== position))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag to reorder. Position 1 = strongest.
        </p>
        {availablePositions.length > 0 && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Position
            </Button>
            {showAddMenu && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-popover border rounded-md shadow-lg p-1 min-w-[140px]">
                {availablePositions.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => handleAddPosition(pos)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded-sm"
                  >
                    {pos} - {POSITION_LABELS[pos]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-6 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground text-sm">
            No positions added yet. Add positions this player can play.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={positions}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {positions.map((position, index) => (
                <SortablePosition
                  key={position}
                  position={position as Position}
                  index={index}
                  onRemove={() => handleRemovePosition(position)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {positions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {positions[0]} is the primary position. The AI will try to place the player there when possible.
        </p>
      )}
    </div>
  )
}
