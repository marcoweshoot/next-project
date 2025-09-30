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

  // Simple admin check - in production you'd want proper role-based access
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  // For now, allow admin access if email contains 'admin' or is a specific admin email
  const isAdmin = profile?.email?.includes('admin') || 
                  profile?.email === 'admin@weshoot.it' ||
                  profile?.email === 'marco@weshoot.it'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Recensioni</h1>
            <p className="text-muted-foreground mt-2">
              Approva, modifica o elimina le recensioni degli utenti
            </p>
          </div>
          <a 
            href="/dashboard" 
            className="text-sm text-primary hover:underline"
          >
            ← Torna alla Dashboard
          </a>
        </div>

        <ReviewsAdminList />
      </div>
    </div>
  )
}
