import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminUserManagement } from '@/components/admin/AdminUserManagement'

export default async function AdminUsersPage() {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verifica se l'utente è super_admin
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  if (error || !roles || roles.length === 0) {
    redirect('/dashboard')
  }

  const isSuperAdmin = roles.some(role => role.role === 'super_admin')

  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestione Utenti Admin</h2>
        <p className="text-muted-foreground">
          Gestisci i permessi degli utenti amministratori
        </p>
      </div>
      
      <AdminUserManagement />
    </div>
  )
}
