import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { PaymentSuccessToast } from '@/components/dashboard/PaymentSuccessToast'
import { PaymentErrorToast } from '@/components/dashboard/PaymentErrorToast'
import { PaymentCancelledToast } from '@/components/dashboard/PaymentCancelledToast'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    payment?: string
    error?: string
    auto_login?: string
    payment_success?: string
    session_id?: string
  }>
}) {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resolvedSearchParams = await searchParams

  if (!user) {
    if (resolvedSearchParams.payment === 'success') {
      if (resolvedSearchParams.session_id) {
        redirect(`/payment-success?session_id=${encodeURIComponent(resolvedSearchParams.session_id)}`)
      }
      redirect('/auth/login?message=payment_success')
    }
    if (resolvedSearchParams.payment === 'cancelled') {
      redirect('/checkout/cancelled')
    }
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardOverview userId={user.id} />
      {resolvedSearchParams.payment === 'success' && <PaymentSuccessToast />}
      {resolvedSearchParams.payment === 'error' && <PaymentErrorToast error={resolvedSearchParams.error} />}
      {resolvedSearchParams.payment === 'cancelled' && <PaymentCancelledToast />}
    </>
  )
}
