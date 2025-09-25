import { redirect } from 'next/navigation'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Gestisci le tue prenotazioni e il tuo profilo
            </p>
          </div>
          <LogoutButton />
        </div>
        {children}
      </div>
    </div>
  )
}
