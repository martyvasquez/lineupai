import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const next = searchParams.get('next') ?? '/dashboard'
  const type = searchParams.get('type')

  const supabase = await createClient()

  // Handle token_hash verification (email confirmation links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Handle different auth types
      if (type === 'recovery') {
        // Password reset - redirect to reset password page
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      if (type === 'email_change') {
        // Email change confirmation - redirect to settings with success message
        return NextResponse.redirect(`${origin}/dashboard/settings?email_changed=true`)
      }

      // Create Stripe customer for new signups (if billing enabled)
      if (process.env.BILLING_ENABLED === 'true' && process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

        // Check if user already has a Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', data.session.user.id)
          .single()

        if (!profile?.stripe_customer_id) {
          try {
            // Create Stripe customer
            const customer = await stripe.customers.create({
              email: data.session.user.email,
              metadata: { supabase_user_id: data.session.user.id }
            })

            // Update profile with Stripe customer ID
            await supabase
              .from('profiles')
              .update({ stripe_customer_id: customer.id })
              .eq('id', data.session.user.id)
          } catch (stripeError) {
            // Log but don't block auth - customer can be created later
            console.error('Failed to create Stripe customer:', stripeError)
          }
        }
      }

      // Default: signup confirmation or magic link - redirect to next
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
