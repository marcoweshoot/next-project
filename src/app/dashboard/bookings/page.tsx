import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingsList } from '@/components/dashboard/BookingsList'

export default async function BookingsPage() {
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
        <h2 className="text-2xl font-bold text-foreground">Le tue prenotazioni</h2>
        <p className="text-muted-foreground">
          Gestisci le tue prenotazioni e i pagamenti
        </p>
      </div>
      
      <BookingsList userId={user.id} />
    </div>
  )
}
