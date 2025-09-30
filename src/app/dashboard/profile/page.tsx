import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserProfile } from '@/components/dashboard/UserProfile'

export default async function ProfilePage() {
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
        <h2 className="text-2xl font-bold text-foreground">Il tuo profilo</h2>
        <p className="text-muted-foreground">
          Gestisci le tue informazioni personali
        </p>
      </div>
      
      <UserProfile userId={user.id} />
    </div>
  )
}
