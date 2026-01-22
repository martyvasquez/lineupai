'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RosterImport } from './roster-import'
import type { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row']

const teamFormSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  age_group: z.string().max(50).optional().nullable(),
  league_name: z.string().max(100).optional().nullable(),
  innings_per_game: z.number().min(1).max(12),
  description: z.string().max(500).optional().nullable(),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

interface TeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: Team | null
  onSave: (data: TeamFormValues) => Promise<Team | null>
  isSaving?: boolean
}

export function TeamDialog({
  open,
  onOpenChange,
  team,
  onSave,
  isSaving,
}: TeamDialogProps) {
  const isEditing = !!team
  const [step, setStep] = useState<'details' | 'import'>('details')
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null)

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      age_group: '',
      league_name: '',
      innings_per_game: 6,
      description: '',
    },
  })

  // Reset form and step when dialog opens/closes or team changes
  useEffect(() => {
    if (open) {
      setStep('details')
      setCreatedTeam(null)
      form.reset({
        name: team?.name || '',
        age_group: team?.age_group || '',
        league_name: team?.league_name || '',
        innings_per_game: team?.innings_per_game || 6,
        description: team?.description || '',
      })
    }
  }, [open, team, form])

  async function handleSubmit(data: TeamFormValues) {
    const result = await onSave(data)
    form.reset()

    // If creating a new team, show the import step
    if (!isEditing && result) {
      setCreatedTeam(result)
      setStep('import')
    }
  }

  function handleImportComplete() {
    onOpenChange(false)
  }

  function handleSkipImport() {
    onOpenChange(false)
  }

  function handleClose() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'details' ? (
          <>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Team' : 'Create Team'}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update your team settings.'
                  : 'Create a new team to manage rosters and generate lineups.'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tigers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 12U"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="innings_per_game"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Innings per Game</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={12}
                            {...field}
                            value={field.value}
                            onChange={e => field.onChange(parseInt(e.target.value) || 6)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="league_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>League Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Central Valley Little League"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Competitive 12U travel ball team in a highly competitive league. Focus on player development while staying competitive."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        This description helps AI generate better lineups by understanding your team context.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Team'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Import Roster</DialogTitle>
              <DialogDescription>
                Import your roster from GameChanger to get started quickly.
              </DialogDescription>
            </DialogHeader>

            {createdTeam && (
              <RosterImport
                teamId={createdTeam.id}
                onImportComplete={handleImportComplete}
                onSkip={handleSkipImport}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
