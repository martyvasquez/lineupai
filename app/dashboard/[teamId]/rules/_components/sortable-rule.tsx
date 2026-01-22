'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Rule = Database['public']['Tables']['team_rules']['Row']

interface SortableRuleProps {
  rule: Rule
  index: number
  onEdit: () => void
  onDelete: () => void
  onToggleActive: (active: boolean) => void
}

export function SortableRule({
  rule,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableRuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 flex items-start gap-3',
        isDragging && 'opacity-50 shadow-lg',
        !rule.active && 'opacity-60 bg-muted/50'
      )}
    >
      <button
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
            #{index + 1}
          </span>
          {!rule.active && (
            <span className="text-xs text-muted-foreground">(disabled)</span>
          )}
        </div>
        <p className={cn(
          'text-sm',
          !rule.active && 'line-through text-muted-foreground'
        )}>
          {rule.rule_text}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Switch
          checked={rule.active ?? true}
          onCheckedChange={onToggleActive}
          aria-label="Toggle rule active"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  )
}
