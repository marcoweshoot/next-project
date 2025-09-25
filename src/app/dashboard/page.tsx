import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // TODO: Fetch user bookings and data
  // const { data: bookings } = await supabase
  //   .from('bookings')
  //   .select('*')
  //   .eq('user_id', session.user.id)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Prenotazioni Attive</h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Viaggi Completati</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Recensioni</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Prenotazioni Recenti</h2>
        <p className="text-muted-foreground">
          Nessuna prenotazione trovata. Inizia esplorando i nostri viaggi!
        </p>
      </div>
    </div>
  )
}
