import { redirect } from 'next/navigation'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { linkOrphanBookingsByEmail } from '@/lib/checkoutClaims'
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

  // Ricollega prenotazioni guest orfane (es. account ricreato con la stessa email)
  if (user.email && user.email_confirmed_at) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await linkOrphanBookingsByEmail(supabaseAdmin, { userId: user.id, email: user.email })
    } catch (err) {
      console.error('Error linking orphan bookings:', err)
    }
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
