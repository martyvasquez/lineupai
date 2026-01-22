import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RulesClient } from './_components/rules-client'

export default async function RulesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('created_by', user.id)
    .single()

  if (!team) {
    redirect('/dashboard')
  }

  // Fetch rule groups
  const { data: ruleGroups } = await supabase
    .from('rule_groups')
    .select('*')
    .eq('team_id', team.id)
    .order('created_at', { ascending: true })

  // Fetch rules ordered by priority
  const { data: rules } = await supabase
    .from('team_rules')
    .select('*')
    .eq('team_id', team.id)
    .order('priority', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Rules</h1>
        <p className="text-muted-foreground">
          Organize rules into groups for different game situations. Select a rule group when generating lineups.
        </p>
      </div>

      <RulesClient
        initialRules={rules || []}
        initialRuleGroups={ruleGroups || []}
        teamId={team.id}
      />
    </div>
  )
}
