import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserGiftCards } from '@/components/dashboard/UserGiftCards'

export default async function GiftCardsPage() {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Le Mie Gift Card</h2>
        <p className="text-muted-foreground">
          Visualizza e gestisci le tue carte regalo WeShoot
        </p>
      </div>
      
      <UserGiftCards />
    </div>
  )
}
