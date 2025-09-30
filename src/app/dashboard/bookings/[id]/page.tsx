import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BookingDetails } from '@/components/dashboard/BookingDetails'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BookingDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = await params
  const supabase = await createServerClientSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !booking) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle prenotazioni
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dettagli prenotazione</h2>
          <p className="text-muted-foreground">
            ID: {booking.id}
          </p>
        </div>
      </div>
      
      <BookingDetails booking={booking} userId={user.id} />
    </div>
  )
}
