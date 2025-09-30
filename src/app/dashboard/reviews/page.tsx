import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReviewsList } from '@/components/dashboard/ReviewsList'

export default async function ReviewsPage() {
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
        <h2 className="text-2xl font-bold text-foreground">Le tue recensioni</h2>
        <p className="text-muted-foreground">
          Gestisci le tue recensioni e valutazioni
        </p>
      </div>
      
      <ReviewsList userId={user.id} />
    </div>
  )
}
