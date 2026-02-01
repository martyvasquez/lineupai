'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import { brandFont } from '@/lib/fonts'
import { Check, Clock, Zap, Users, BarChart3, Shield } from 'lucide-react'

interface TrialStatus {
  isExpired: boolean
  daysRemaining: number
  isCanceled: boolean
}

export default function SubscribePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function checkTrialStatus() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_ends_at, subscription_status')
        .eq('id', user.id)
        .single()

      if (profile) {
        const trialEnd = new Date(profile.trial_ends_at)
        const now = new Date()
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        setTrialStatus({
          isExpired: daysRemaining <= 0,
          daysRemaining: Math.max(0, daysRemaining),
          isCanceled: profile.subscription_status === 'canceled',
        })
      }
    }

    checkTrialStatus()
  }, [supabase, router])

  async function handleSubscribe() {
    setIsLoading(true)

    try {
      // Canceled users go to portal to resubscribe (has payment info on file)
      const endpoint = trialStatus?.isCanceled
        ? '/api/billing/create-portal'
        : '/api/billing/create-checkout'

      const response = await fetch(endpoint, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const features = [
    { icon: Zap, label: 'AI-powered lineup generation' },
    { icon: Users, label: 'Unlimited teams and players' },
    { icon: BarChart3, label: 'GameChanger stats integration' },
    { icon: Shield, label: 'League rule compliance' },
  ]

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className={`text-2xl ${brandFont.className}`}>
          Peanut Manager
        </CardTitle>
        <CardDescription>
          {trialStatus?.isCanceled ? (
            <span className="text-destructive font-medium">
              Your subscription has been canceled
            </span>
          ) : trialStatus?.isExpired ? (
            <span className="text-destructive font-medium">
              Your free trial has expired
            </span>
          ) : trialStatus ? (
            <span className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'day' : 'days'} left in your trial
            </span>
          ) : (
            'Loading...'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold">$10</div>
          <div className="text-muted-foreground">per month</div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-center">Everything you need:</p>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                {feature.label}
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleSubscribe}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : trialStatus?.isCanceled ? 'Resubscribe' : 'Subscribe - $10/month'}
        </Button>

        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Sign out
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
