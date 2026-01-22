'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/hooks/use-toast'
import { Plus, FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { SortableRule } from './sortable-rule'
import { RuleDialog } from './rule-dialog'
import { RuleGroupDialog } from './rule-group-dialog'
import type { Database } from '@/types/database'

type Rule = Database['public']['Tables']['team_rules']['Row']
type RuleGroup = Database['public']['Tables']['rule_groups']['Row']

interface RulesClientProps {
  initialRules: Rule[]
  initialRuleGroups: RuleGroup[]
  teamId: string
}

export function RulesClient({ initialRules, initialRuleGroups, teamId }: RulesClientProps) {
  const [mounted, setMounted] = useState(false)
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>(initialRuleGroups)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initialRuleGroups.length > 0 ? initialRuleGroups[0].id : null
  )
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [editingGroup, setEditingGroup] = useState<RuleGroup | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Prevent hydration mismatch with DndContext by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter rules by selected group
  const filteredRules = selectedGroupId
    ? rules.filter(r => r.rule_group_id === selectedGroupId)
    : []

  const selectedGroup = ruleGroups.find(g => g.id === selectedGroupId)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = filteredRules.findIndex((r) => r.id === active.id)
      const newIndex = filteredRules.findIndex((r) => r.id === over.id)

      const newFilteredRules = arrayMove(filteredRules, oldIndex, newIndex)

      // Update the full rules array
      const otherRules = rules.filter(r => r.rule_group_id !== selectedGroupId)
      setRules([...otherRules, ...newFilteredRules])

      // Update priorities in database
      for (let i = 0; i < newFilteredRules.length; i++) {
        await supabase
          .from('team_rules')
          .update({ priority: i })
          .eq('id', newFilteredRules[i].id)
      }

      toast({
        title: 'Order updated',
        description: 'Rule priorities have been updated.',
      })
    }
  }

  // Rule Group handlers
  const handleAddGroup = () => {
    setEditingGroup(null)
    setGroupDialogOpen(true)
  }

  const handleEditGroup = (group: RuleGroup) => {
    setEditingGroup(group)
    setGroupDialogOpen(true)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this rule group? All rules in this group will also be deleted.')) return

    const { error } = await supabase
      .from('rule_groups')
      .delete()
      .eq('id', groupId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule group.',
        variant: 'destructive',
      })
      return
    }

    setRuleGroups(ruleGroups.filter(g => g.id !== groupId))
    setRules(rules.filter(r => r.rule_group_id !== groupId))

    // Select another group if we deleted the selected one
    if (selectedGroupId === groupId) {
      const remaining = ruleGroups.filter(g => g.id !== groupId)
      setSelectedGroupId(remaining.length > 0 ? remaining[0].id : null)
    }

    toast({
      title: 'Rule group deleted',
      description: 'The rule group and its rules have been removed.',
    })
  }

  const handleSaveGroup = async (name: string, description: string | null) => {
    if (editingGroup) {
      // Update existing group
      const { error } = await supabase
        .from('rule_groups')
        .update({ name, description })
        .eq('id', editingGroup.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update rule group.',
          variant: 'destructive',
        })
        return
      }

      setRuleGroups(ruleGroups.map(g =>
        g.id === editingGroup.id ? { ...g, name, description } : g
      ))
      toast({
        title: 'Rule group updated',
        description: 'The rule group has been updated.',
      })
    } else {
      // Create new group
      const { data: newGroup, error } = await supabase
        .from('rule_groups')
        .insert({
          team_id: teamId,
          name,
          description,
        })
        .select()
        .single()

      if (error || !newGroup) {
        toast({
          title: 'Error',
          description: 'Failed to create rule group.',
          variant: 'destructive',
        })
        return
      }

      setRuleGroups([...ruleGroups, newGroup])
      setSelectedGroupId(newGroup.id)
      toast({
        title: 'Rule group created',
        description: 'The rule group has been created.',
      })
    }

    setGroupDialogOpen(false)
  }

  // Rule handlers
  const handleAddRule = () => {
    setEditingRule(null)
    setRuleDialogOpen(true)
  }

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule)
    setRuleDialogOpen(true)
  }

  const handleToggleActive = async (ruleId: string, active: boolean) => {
    const { error } = await supabase
      .from('team_rules')
      .update({ active })
      .eq('id', ruleId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule.',
        variant: 'destructive',
      })
      return
    }

    setRules(rules.map(r => r.id === ruleId ? { ...r, active } : r))
    toast({
      title: active ? 'Rule enabled' : 'Rule disabled',
      description: `The rule has been ${active ? 'enabled' : 'disabled'}.`,
    })
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return

    const { error } = await supabase
      .from('team_rules')
      .delete()
      .eq('id', ruleId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule.',
        variant: 'destructive',
      })
      return
    }

    setRules(rules.filter(r => r.id !== ruleId))
    toast({
      title: 'Rule deleted',
      description: 'The rule has been removed.',
    })
  }

  const handleSaveRule = async (ruleText: string) => {
    if (!selectedGroupId) {
      toast({
        title: 'Error',
        description: 'Please select or create a rule group first.',
        variant: 'destructive',
      })
      return
    }

    if (editingRule) {
      // Update existing rule
      const { error } = await supabase
        .from('team_rules')
        .update({ rule_text: ruleText })
        .eq('id', editingRule.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update rule.',
          variant: 'destructive',
        })
        return
      }

      setRules(rules.map(r => r.id === editingRule.id ? { ...r, rule_text: ruleText } : r))
      toast({
        title: 'Rule updated',
        description: 'The rule has been updated.',
      })
    } else {
      // Create new rule
      const newPriority = filteredRules.length
      const { data: newRule, error } = await supabase
        .from('team_rules')
        .insert({
          team_id: teamId,
          rule_group_id: selectedGroupId,
          rule_text: ruleText,
          priority: newPriority,
          active: true,
        })
        .select()
        .single()

      if (error || !newRule) {
        toast({
          title: 'Error',
          description: 'Failed to create rule.',
          variant: 'destructive',
        })
        return
      }

      setRules([...rules, newRule])
      toast({
        title: 'Rule added',
        description: 'The rule has been added to this group.',
      })
    }

    setRuleDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Rule Groups Section */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {ruleGroups.length} group{ruleGroups.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={handleAddGroup} variant="outline">
          <FolderPlus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>

      {ruleGroups.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">
            No rule groups yet. Create a rule group to start adding rules.
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Rule groups let you organize different sets of rules for different situations,
            like tournaments vs regular league games.
          </p>
          <Button onClick={handleAddGroup}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Create First Group
          </Button>
        </div>
      ) : (
        <>
          {/* Group Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
            {ruleGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedGroupId === group.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Selected Group Actions */}
          {selectedGroup && (
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{selectedGroup.name}</h3>
                {selectedGroup.description && (
                  <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditGroup(selectedGroup)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGroup(selectedGroup.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Rules in Selected Group */}
          {selectedGroupId && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''} in this group
                </p>
                <Button onClick={handleAddRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {filteredRules.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-4">
                    No rules in this group yet.
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Add rules to define how AI should generate lineups when using this rule group.
                  </p>
                </div>
              ) : mounted ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredRules.map(r => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {filteredRules.map((rule, index) => (
                        <SortableRule
                          key={rule.id}
                          rule={rule}
                          index={index}
                          onEdit={() => handleEditRule(rule)}
                          onDelete={() => handleDeleteRule(rule.id)}
                          onToggleActive={(active) => handleToggleActive(rule.id, active)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="space-y-2">
                  {filteredRules.map((rule, index) => (
                    <SortableRule
                      key={rule.id}
                      rule={rule}
                      index={index}
                      onEdit={() => handleEditRule(rule)}
                      onDelete={() => handleDeleteRule(rule.id)}
                      onToggleActive={(active) => handleToggleActive(rule.id, active)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <RuleDialog
        open={ruleDialogOpen}
        onOpenChange={setRuleDialogOpen}
        rule={editingRule}
        onSave={handleSaveRule}
      />

      <RuleGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        ruleGroup={editingGroup}
        onSave={handleSaveGroup}
      />
    </div>
  )
}
