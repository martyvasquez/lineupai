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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Database } from '@/types/database'

type RuleGroup = Database['public']['Tables']['rule_groups']['Row']

interface RuleGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ruleGroup: RuleGroup | null
  onSave: (name: string, description: string | null) => Promise<void>
}

export function RuleGroupDialog({ open, onOpenChange, ruleGroup, onSave }: RuleGroupDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (ruleGroup) {
      setName(ruleGroup.name)
      setDescription(ruleGroup.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [ruleGroup, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await onSave(name.trim(), description.trim() || null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{ruleGroup ? 'Edit Rule Group' : 'Create Rule Group'}</DialogTitle>
          <DialogDescription>
            Rule groups let you organize different sets of rules for different game situations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tournament, Practice, League"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Competitive rules for tournament games"
              rows={3}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Example groups:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Tournament</strong> - Prioritize winning with best players</li>
              <li><strong>League</strong> - Balance competitiveness with equal playing time</li>
              <li><strong>Practice</strong> - Focus on player development</li>
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
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Saving...' : ruleGroup ? 'Save Changes' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
