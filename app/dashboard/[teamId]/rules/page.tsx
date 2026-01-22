import { createClient } from '@/lib/supabase/server'
import { RulesClient } from './_components/rules-client'

interface RulesPageProps {
  params: Promise<{ teamId: string }>
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { teamId } = await params
  const supabase = await createClient()

  // Note: Auth and team ownership are validated by the layout

  // Fetch rule groups
  const { data: ruleGroups } = await supabase
    .from('rule_groups')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })

  // Fetch rules ordered by priority
  const { data: rules } = await supabase
    .from('team_rules')
    .select('*')
    .eq('team_id', teamId)
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
        teamId={teamId}
      />
    </div>
  )
}
