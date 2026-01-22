import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle different auth types
      if (type === 'recovery') {
        // Password reset - redirect to reset password page
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      if (type === 'email_change') {
        // Email change confirmation - redirect to settings with success message
        return NextResponse.redirect(`${origin}/dashboard/settings?email_changed=true`)
      }

      // Default: signup confirmation or magic link - redirect to next
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
