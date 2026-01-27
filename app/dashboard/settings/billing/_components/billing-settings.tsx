'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'
import { Clock, CreditCard, CheckCircle, AlertCircle, Gift } from 'lucide-react'

interface BillingSettingsProps {
  billingEnabled: boolean
  subscriptionStatus: string
  trialEndsAt: string | null
  isLifetimeFree: boolean
  subscriptionPeriodEnd: string | null
}

export function BillingSettings({
  billingEnabled,
  subscriptionStatus,
  trialEndsAt,
  isLifetimeFree,
  subscriptionPeriodEnd,
}: BillingSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null
  const periodEndDate = subscriptionPeriodEnd ? new Date(subscriptionPeriodEnd) : null
  const now = new Date()
  const daysRemaining = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  async function handleManageBilling() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/billing/create-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      // Redirect to Stripe Portal
      window.location.href = data.url
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  async function handleSubscribe() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  // Billing not enabled - show that it's free
  if (!billingEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Free Access
          </CardTitle>
          <CardDescription>
            Billing is currently disabled. Enjoy full access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            All features unlocked
          </Badge>
        </CardContent>
      </Card>
    )
  }

  // Lifetime free user
  if (isLifetimeFree) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Lifetime Free Access
          </CardTitle>
          <CardDescription>
            You have lifetime free access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Lifetime member
          </Badge>
        </CardContent>
      </Card>
    )
  }

  type BadgeVariant = 'secondary' | 'destructive' | 'default' | 'outline'

  // Render based on subscription status
  const getStatusConfig = () => {
    const trialingConfig = {
      icon: Clock,
      title: 'Free Trial',
      description: daysRemaining > 0
        ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining in your trial`
        : 'Your trial has expired',
      badgeVariant: (daysRemaining > 0 ? 'secondary' : 'destructive') as BadgeVariant,
      badgeText: daysRemaining > 0 ? 'Trial active' : 'Trial expired',
      showSubscribe: true,
    }

    const statusConfig: Record<string, typeof trialingConfig> = {
      trialing: trialingConfig,
      active: {
        icon: CheckCircle,
        title: 'Active Subscription',
        description: periodEndDate
          ? `Your subscription is active. Next billing date: ${formatDate(periodEndDate)}`
          : 'Your subscription is active. Thank you for your support!',
        badgeVariant: 'secondary' as BadgeVariant,
        badgeText: 'Active',
        showSubscribe: false,
      },
      past_due: {
        icon: AlertCircle,
        title: 'Payment Past Due',
        description: 'Your last payment failed. Please update your payment method.',
        badgeVariant: 'destructive' as BadgeVariant,
        badgeText: 'Past due',
        showSubscribe: false,
      },
      canceled: {
        icon: AlertCircle,
        title: 'Subscription Canceled',
        description: periodEndDate
          ? `Your subscription was canceled. Access until: ${formatDate(periodEndDate)}`
          : 'Your subscription has been canceled.',
        badgeVariant: 'destructive' as BadgeVariant,
        badgeText: 'Canceled',
        showSubscribe: true,
      },
    }

    return statusConfig[subscriptionStatus] || trialingConfig
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          {config.title}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={config.badgeVariant}>
            {config.badgeText}
          </Badge>
          <span className="text-sm text-muted-foreground">
            $10/month
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {config.showSubscribe && (
            <Button onClick={handleSubscribe} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Subscribe Now'}
            </Button>
          )}

          {(subscriptionStatus === 'active' || subscriptionStatus === 'past_due') && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Manage Billing'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
