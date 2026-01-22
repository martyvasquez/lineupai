import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, User } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get team count for display
  const { count: teamCount } = await supabase
    .from('teams')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your teams and account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/settings/teams">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Settings
              </CardTitle>
              <CardDescription>
                Create and manage your teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {teamCount === 0
                  ? 'No teams yet'
                  : `${teamCount} ${teamCount === 1 ? 'team' : 'teams'}`}
              </p>
              <span className="text-sm text-primary hover:underline">
                Manage teams →
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settings/account">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your email and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <span className="text-sm text-primary hover:underline">
                Manage profile →
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
