'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Database } from '@/types/database'

type Rule = Database['public']['Tables']['team_rules']['Row']

interface RuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: Rule | null
  onSave: (ruleText: string) => Promise<void>
}

export function RuleDialog({ open, onOpenChange, rule, onSave }: RuleDialogProps) {
  const [ruleText, setRuleText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (rule) {
      setRuleText(rule.rule_text)
    } else {
      setRuleText('')
    }
  }, [rule, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleText.trim()) return

    setIsLoading(true)
    try {
      await onSave(ruleText.trim())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
          <DialogDescription>
            Write your rule in plain language. The AI will interpret and enforce it during lineup generation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule">Rule *</Label>
            <Textarea
              id="rule"
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              placeholder="e.g., Every player must play at least 3 innings in the field"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Be specific and clear. The AI works best with concrete, measurable rules.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Example rules:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Every player must bat at least once per game</li>
              <li>No player can pitch more than 2 innings</li>
              <li>Players must sit out at most 1 inning per game</li>
              <li>Rotate catchers every 2 innings</li>
              <li>Keep the batting order balanced (alternate stronger/weaker batters)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !ruleText.trim()}>
              {isLoading ? 'Saving...' : rule ? 'Save Changes' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
