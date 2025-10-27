import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { StatisticsClient } from '@/components/admin/StatisticsClient'

interface BookingStats {
  total: number
  paid: number
  pending: number
  refunded: number
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

interface GiftCardStats {
  total_sold: number
  total_value: number
  total_used: number
  total_remaining: number
  this_month_sold: number
  this_month_value: number
  most_popular_amounts: Array<{amount: number, count: number}>
}

interface BookingData {
  id: string
  status: string
  total_amount: number
  deposit_amount: number
  created_at: string
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

  // Usa Service Role Key per bypassare RLS nelle statistiche
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Fetch delle statistiche e dati per grafici
  const [
    bookingStats,
    revenueStats,
    userStats,
    reviewStats,
    tourStats,
    giftCardStats,
    bookingsData
  ]: [
    BookingStats,
    RevenueStats,
    UserStats,
    ReviewStats,
    TourStats,
    GiftCardStats,
    BookingData[]
  ] = await Promise.all([
    // Statistiche prenotazioni
    adminSupabase
      .from('bookings')
      .select('status, created_at')
      .then(({ data }) => {
        const stats: BookingStats = {
          total: data?.length || 0,
          paid: data?.filter(b => b.status === 'fully_paid').length || 0,
          pending: data?.filter(b => b.status === 'deposit_paid').length || 0,
          refunded: data?.filter(b => b.status === 'refunded').length || 0,
        }
        return stats
      }),

    // Statistiche revenue
    adminSupabase
      .from('bookings')
      .select('status, total_amount, created_at')
      .then(({ data }) => {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const stats: RevenueStats = {
          total: data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
          paid: data?.filter(b => b.status === 'fully_paid').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
          pending: data?.filter(b => b.status === 'deposit_paid').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
          this_month: data?.filter(b => 
            new Date(b.created_at) >= thisMonth && b.status === 'fully_paid'
          ).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
          last_month: data?.filter(b => 
            new Date(b.created_at) >= lastMonth && 
            new Date(b.created_at) <= lastMonthEnd && 
            b.status === 'fully_paid'
          ).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
        }
        return stats
      }),

    // Statistiche utenti
    adminSupabase
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
    adminSupabase
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
    adminSupabase
      .from('bookings')
      .select('tour_title')
      .then(({ data }) => {
        const tourCounts: Record<string, number> = {}
        data?.forEach(booking => {
          if (booking.tour_title) {
            tourCounts[booking.tour_title] = (tourCounts[booking.tour_title] || 0) + 1
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
    adminSupabase
      .from('bookings')
      .select('id, status, total_amount, deposit_amount, created_at')
      .then(({ data }) => data || []),

    // Statistiche Gift Card
    adminSupabase
      .from('gift_cards')
      .select('amount, remaining_balance, created_at, status')
      .then(({ data }) => {
        if (!data) return {
          total_sold: 0,
          total_value: 0,
          total_used: 0,
          total_remaining: 0,
          this_month_sold: 0,
          this_month_value: 0,
          most_popular_amounts: []
        }

        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const totalSold = data.length
        const totalValue = data.reduce((sum, gc) => sum + gc.amount, 0)
        const totalRemaining = data.reduce((sum, gc) => sum + gc.remaining_balance, 0)
        const totalUsed = totalValue - totalRemaining
        
        const thisMonthCards = data.filter(gc => new Date(gc.created_at) >= thisMonth)
        const thisMonthSold = thisMonthCards.length
        const thisMonthValue = thisMonthCards.reduce((sum, gc) => sum + gc.amount, 0)
        
        // Most popular amounts
        const amountCounts = data.reduce((acc, gc) => {
          const amount = gc.amount / 100 // Convert to euros
          acc[amount] = (acc[amount] || 0) + 1
          return acc
        }, {} as Record<number, number>)
        
        const mostPopularAmounts = Object.entries(amountCounts)
          .map(([amount, count]) => ({ amount: parseInt(amount), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        return {
          total_sold: totalSold,
          total_value: totalValue,
          total_used: totalUsed,
          total_remaining: totalRemaining,
          this_month_sold: thisMonthSold,
          this_month_value: thisMonthValue,
          most_popular_amounts: mostPopularAmounts
        }
      }),
  ])

  return (
    <StatisticsClient
      bookingStats={bookingStats}
      revenueStats={revenueStats}
      userStats={userStats}
      reviewStats={reviewStats}
      tourStats={tourStats}
      giftCardStats={giftCardStats}
      bookingsData={bookingsData}
    />
  )
}
