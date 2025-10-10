import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatisticsClient } from '@/components/admin/StatisticsClient'

interface BookingStats {
  total: number
  paid: number
  pending: number
  cancelled: number
}

interface RevenueStats {
  total: number
  paid: number
  pending: number
  this_month: number
  last_month: number
}

interface UserStats {
  total: number
  active: number
  new_this_month: number
}

interface ReviewStats {
  total: number
  approved: number
  pending: number
  average_rating: number
}

interface TourStats {
  total: number
  most_booked: Array<{name: string, bookings: number}>
}

export default async function AdminStatisticsPage() {
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

  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Fetch delle statistiche e dati per grafici
  const [
    bookingStats,
    revenueStats,
    userStats,
    reviewStats,
    tourStats,
    bookingsData
  ] = await Promise.all([
    // Statistiche prenotazioni
    supabase
      .from('bookings')
      .select('status, created_at')
      .then(({ data }) => {
        const stats: BookingStats = {
          total: data?.length || 0,
          paid: data?.filter(b => b.status === 'paid').length || 0,
          pending: data?.filter(b => b.status === 'pending').length || 0,
          cancelled: data?.filter(b => b.status === 'cancelled').length || 0,
        }
        return stats
      }),

    // Statistiche revenue
    supabase
      .from('bookings')
      .select('status, total_price, created_at')
      .then(({ data }) => {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const stats: RevenueStats = {
          total: data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
          paid: data?.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
          pending: data?.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
          this_month: data?.filter(b => 
            new Date(b.created_at) >= thisMonth && b.status === 'paid'
          ).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
          last_month: data?.filter(b => 
            new Date(b.created_at) >= lastMonth && 
            new Date(b.created_at) <= lastMonthEnd && 
            b.status === 'paid'
          ).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
        }
        return stats
      }),

    // Statistiche utenti
    supabase
      .from('profiles')
      .select('created_at, updated_at')
      .then(({ data }) => {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const stats: UserStats = {
          total: data?.length || 0,
          active: data?.filter(p => 
            new Date(p.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length || 0,
          new_this_month: data?.filter(p => 
            new Date(p.created_at) >= thisMonth
          ).length || 0,
        }
        return stats
      }),

    // Statistiche recensioni
    supabase
      .from('reviews')
      .select('status, rating')
      .then(({ data }) => {
        const stats: ReviewStats = {
          total: data?.length || 0,
          approved: data?.filter(r => r.status === 'approved').length || 0,
          pending: data?.filter(r => r.status === 'pending').length || 0,
          average_rating: data?.length > 0 
            ? data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length 
            : 0,
        }
        return stats
      }),

    // Statistiche tour
    supabase
      .from('bookings')
      .select('tour_name')
      .then(({ data }) => {
        const tourCounts: Record<string, number> = {}
        data?.forEach(booking => {
          if (booking.tour_name) {
            tourCounts[booking.tour_name] = (tourCounts[booking.tour_name] || 0) + 1
          }
        })
        
        const mostBooked = Object.entries(tourCounts)
          .map(([name, bookings]) => ({ name, bookings }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5)

        const stats: TourStats = {
          total: Object.keys(tourCounts).length,
          most_booked: mostBooked,
        }
        return stats
      }),

    // Dati completi bookings per grafici
    supabase
      .from('bookings')
      .select('id, status, total_amount, deposit_amount, created_at')
      .then(({ data }) => data || []),
  ])

  return (
    <StatisticsClient
      bookingStats={bookingStats}
      revenueStats={revenueStats}
      userStats={userStats}
      reviewStats={reviewStats}
      tourStats={tourStats}
      bookingsData={bookingsData}
    />
  )
}
