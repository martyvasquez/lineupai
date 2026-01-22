import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all teams for this user
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, age_group')
    .eq('created_by', user.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header teams={teams || []} />
      <main className="container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
    </div>
  )
}
