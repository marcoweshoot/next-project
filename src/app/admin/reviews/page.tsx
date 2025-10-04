import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReviewsAdminList } from '@/components/admin/ReviewsAdminList'

export default async function AdminReviewsPage() {
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
        <h2 className="text-2xl font-bold text-foreground">Gestione Recensioni</h2>
        <p className="text-muted-foreground">
          Approva, modifica o elimina le recensioni degli utenti
        </p>
      </div>
      
      <ReviewsAdminList />
    </div>
  )
}
