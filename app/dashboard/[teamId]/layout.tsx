import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface TeamLayoutProps {
  children: React.ReactNode
  params: Promise<{ teamId: string }>
}

export default async function TeamLayout({ children, params }: TeamLayoutProps) {
  const { teamId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Validate user owns this team
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .eq('created_by', user.id)
    .single()

  if (!team) {
    // Team doesn't exist or user doesn't own it
    redirect('/dashboard')
  }

  return <>{children}</>
}
