import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Use service role to bypass RLS for webhook updates
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    // Check if billing is enabled
    if (process.env.BILLING_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Billing is not enabled' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    // Handle events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Map Stripe status to our status
        let subscriptionStatus: string
        switch (subscription.status) {
          case 'active':
            subscriptionStatus = 'active'
            break
          case 'trialing':
            subscriptionStatus = 'trialing'
            break
          case 'past_due':
            subscriptionStatus = 'past_due'
            break
          case 'canceled':
          case 'unpaid':
            subscriptionStatus = 'canceled'
            break
          default:
            subscriptionStatus = subscription.status
        }

        // Get period end date (next billing date for active, last access date for canceled)
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Update profile by Stripe customer ID
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscriptionStatus,
            subscription_period_end: periodEnd,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Failed to update subscription status:', error)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get the final access date
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Set status to canceled with final access date
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_period_end: periodEnd,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Failed to update subscription status:', error)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Set status to past_due
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Failed to update subscription status:', error)
        }

        break
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
