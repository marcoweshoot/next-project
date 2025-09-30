import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PaymentsList } from '@/components/dashboard/PaymentsList'

export default async function PaymentsPage() {
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
        <h2 className="text-2xl font-bold text-foreground">I tuoi pagamenti</h2>
        <p className="text-muted-foreground">
          Gestisci i tuoi pagamenti e le scadenze
        </p>
      </div>
      
      <PaymentsList userId={user.id} />
    </div>
  )
}