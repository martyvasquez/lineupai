import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountSettings } from '../_components/account-settings'

export default async function AccountSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your email and password.
        </p>
      </div>

      <AccountSettings userEmail={user.email || ''} />
    </div>
  )
}
