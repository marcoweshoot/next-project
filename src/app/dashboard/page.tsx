import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { PaymentSuccessToast } from '@/components/dashboard/PaymentSuccessToast'
import { PaymentErrorToast } from '@/components/dashboard/PaymentErrorToast'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    payment?: string; 
    error?: string; 
    auto_login?: string;
    payment_success?: string;
  }>
}) {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resolvedSearchParams = await searchParams

  // Se non c'è utente ma ci sono parametri di auto-login, gestisci l'auto-login
  if (!user && resolvedSearchParams.auto_login === 'true' && resolvedSearchParams.payment_success === 'true') {
    // Redirect a una pagina client-side che gestirà l'auto-login
    redirect('/auto-login')
  }

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardOverview userId={user.id} />
      {resolvedSearchParams.payment === 'success' && <PaymentSuccessToast />}
      {resolvedSearchParams.payment === 'error' && <PaymentErrorToast error={resolvedSearchParams.error} />}
    </>
  )
}
