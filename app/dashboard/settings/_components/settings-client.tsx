'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/lib/hooks/use-toast'
import { Plus, Users, Pencil, Trash2 } from 'lucide-react'
import { TeamDialog } from './team-dialog'
import type { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row'] & {
  player_count?: number
  game_count?: number
}

interface SettingsClientProps {
  initialTeams: Team[]
  userId: string
}

export function SettingsClient({ initialTeams, userId }: SettingsClientProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  async function handleSaveTeam(data: {
    name: string
    age_group?: string | null
  }): Promise<Team | null> {
    setIsSaving(true)
    try {
      if (editingTeam) {
        // Update existing team
        const { data: updated, error } = await supabase
          .from('teams')
          .update({
            name: data.name,
            age_group: data.age_group || null,
          })
          .eq('id', editingTeam.id)
          .select()
          .single()

        if (error) throw error

        setTeams(teams.map(t => t.id === editingTeam.id ? { ...t, ...updated } : t))
        toast({ title: 'Team updated successfully' })
        setDialogOpen(false)
        setEditingTeam(null)
        router.refresh()
        return null // Don't show import step for edits
      } else {
        // Create new team
        const { data: created, error } = await supabase
          .from('teams')
          .insert({
            name: data.name,
            age_group: data.age_group || null,
            created_by: userId,
          })
          .select()
          .single()

        if (error) throw error

        setTeams([...teams, { ...created, player_count: 0, game_count: 0 }])
        toast({ title: 'Team created successfully' })
        // Don't close dialog yet - let it show the import step
        setEditingTeam(null)
        router.refresh()
        return created // Return created team for import step
      }
    } catch (error) {
      console.error('Error saving team:', error)
      toast({
        title: 'Error saving team',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteTeam() {
    if (!deleteTeam) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', deleteTeam.id)

      if (error) throw error

      setTeams(teams.filter(t => t.id !== deleteTeam.id))
      toast({ title: 'Team deleted successfully' })
      setDeleteTeam(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting team:', error)
      toast({
        title: 'Error deleting team',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  function openEditDialog(team: Team) {
    setEditingTeam(team)
    setDialogOpen(true)
  }

  function openCreateDialog() {
    setEditingTeam(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Teams</h2>
          <p className="text-sm text-muted-foreground">
            Manage your teams, create new ones, or edit existing settings.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first team to start managing rosters and generating lineups.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/dashboard/${team.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    {team.age_group && (
                      <CardDescription>
                        {team.age_group}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(team)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTeam(team)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{team.player_count ?? 0} players</span>
                  <span>{team.game_count ?? 0} games</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeamDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingTeam(null)
        }}
        team={editingTeam}
        onSave={handleSaveTeam}
        onImportComplete={(teamId, playerCount) => {
          setTeams(prev => prev.map(t =>
            t.id === teamId ? { ...t, player_count: playerCount } : t
          ))
        }}
        isSaving={isSaving}
      />

      <AlertDialog open={!!deleteTeam} onOpenChange={() => setDeleteTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTeam?.name}&quot;? This will permanently
              delete all players, games, rules, and lineups associated with this team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
