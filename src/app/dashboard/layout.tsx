import { redirect } from 'next/navigation'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'
import Header from '@/components/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-20 lg:pt-24">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Gestisci le tue prenotazioni e il tuo profilo
            </p>
          </div>
          <LogoutButton />
        </div>
        
        <div className="mb-6">
          <DashboardNavigation />
        </div>
        
        {children}
      </div>
    </div>
  )
}
