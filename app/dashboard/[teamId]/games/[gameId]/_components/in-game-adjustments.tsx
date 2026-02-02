'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InGameAdjustmentsProps {
  currentInnings: number
  onInningsChange: (innings: number) => void
  onRegenerateInnings: (feedback: string) => void
  isGenerating?: boolean
}

export function InGameAdjustments({
  currentInnings,
  onInningsChange,
  onRegenerateInnings,
  isGenerating = false,
}: InGameAdjustmentsProps) {
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [regenerateFeedback, setRegenerateFeedback] = useState('')

  const inningOptions = Array.from({ length: 9 }, (_, i) => i + 1)

  const handleRegenerate = () => {
    onRegenerateInnings(regenerateFeedback.trim())
    setShowRegenerateDialog(false)
    setRegenerateFeedback('')
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Adjust Innings */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Innings:</span>
        <Select
          value={currentInnings.toString()}
          onValueChange={(value) => onInningsChange(parseInt(value, 10))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {inningOptions.map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Regenerate Innings */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isGenerating}
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Defensive Positions</DialogTitle>
            <DialogDescription>
              All positions that are not locked will be regenerated. Use the feedback field to guide the AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regenerate-feedback">Feedback for AI</Label>
              <Textarea
                id="regenerate-feedback"
                placeholder="e.g., 'Move Jake to outfield', 'Cole should pitch inning 3', 'More rotation in infield'..."
                value={regenerateFeedback}
                onChange={(e) => setRegenerateFeedback(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tell the AI what changes you want. It will see the current lineup and your feedback.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isGenerating}>
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
