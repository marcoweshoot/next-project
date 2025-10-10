import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Users, BarChart3, Calendar } from 'lucide-react'
import Header from '@/components/Header'

export default async function AdminLayout({
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
  const isSuperAdmin = roles.some(role => role.role === 'super_admin')

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-20 lg:pt-24">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna al Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Pannello Admin</h1>
            <p className="text-muted-foreground">
              Gestisci recensioni, utenti e visualizza statistiche
            </p>
          </div>
        </div>
        
        {/* Admin Navigation */}
        <div className="mb-6">
          <nav className="flex gap-2 flex-wrap">
            <Link href="/admin/statistics">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistiche
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prenotazioni
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Recensioni
              </Button>
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Gestione Utenti
                </Button>
              </Link>
            )}
          </nav>
        </div>
        
        {children}
      </div>
    </div>
  )
}
