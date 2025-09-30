import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { PaymentSuccessToast } from '@/components/dashboard/PaymentSuccessToast'
import { PaymentErrorToast } from '@/components/dashboard/PaymentErrorToast'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; error?: string }>
}) {
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const resolvedSearchParams = await searchParams

  return (
    <>
      <DashboardOverview userId={user.id} />
      {resolvedSearchParams.payment === 'success' && <PaymentSuccessToast />}
      {resolvedSearchParams.payment === 'error' && <PaymentErrorToast error={resolvedSearchParams.error} />}
    </>
  )
}
