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

  // Se non c'è utente ma c'è stato un pagamento, redirect al login con messaggio
  if (!user) {
    if (resolvedSearchParams.payment === 'success') {
      redirect('/auth/login?message=payment_success')
    }
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
