import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingsAdminList } from '@/components/admin/BookingsAdminList'

export default async function AdminBookingsPage() {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verifica se l'utente è admin
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  if (error || !roles || roles.length === 0) {
    redirect('/dashboard')
  }

  const isAdmin = roles.some(role => 
    role.role === 'admin' || role.role === 'super_admin'
  )

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestione Prenotazioni</h2>
        <p className="text-muted-foreground">
          Visualizza e gestisci tutte le prenotazioni dei viaggi fotografici
        </p>
      </div>
      
      <BookingsAdminList />
    </div>
  )
}

