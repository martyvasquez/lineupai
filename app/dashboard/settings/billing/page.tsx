import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingSettings } from './_components/billing-settings'

export default async function BillingSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get billing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at, is_lifetime_free, subscription_period_end')
    .eq('id', user.id)
    .single()

  const billingEnabled = process.env.BILLING_ENABLED === 'true'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing.
        </p>
      </div>

      <BillingSettings
        billingEnabled={billingEnabled}
        subscriptionStatus={profile?.subscription_status || 'trialing'}
        trialEndsAt={profile?.trial_ends_at || null}
        isLifetimeFree={profile?.is_lifetime_free || false}
        subscriptionPeriodEnd={profile?.subscription_period_end || null}
      />
    </div>
  )
}
