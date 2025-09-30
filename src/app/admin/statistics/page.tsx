import { createServerClientSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'

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

  // Fetch delle statistiche
  const [
    bookingStats,
    revenueStats,
    userStats,
    reviewStats,
    tourStats
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
  ])

  const revenueGrowth = revenueStats.last_month > 0 
    ? ((revenueStats.this_month - revenueStats.last_month) / revenueStats.last_month * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Statistiche Generali</h2>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasso Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{revenueStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              €{revenueStats.paid.toLocaleString()} confermati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasso Questo Mese</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{revenueStats.this_month.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% vs mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa di Pagamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{revenueStats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Da confermare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prenotazioni Totali</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.paid} pagate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Booking Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Stato Prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Pagate</span>
              </div>
              <Badge variant="secondary">{bookingStats.paid}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>In Attesa</span>
              </div>
              <Badge variant="outline">{bookingStats.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Cancellate</span>
              </div>
              <Badge variant="destructive">{bookingStats.cancelled}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statistiche Utenti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Utenti Totali</span>
              <Badge variant="secondary">{userStats.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Utenti Attivi (30gg)</span>
              <Badge variant="outline">{userStats.active}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Nuovi Questo Mese</span>
              <Badge variant="default">{userStats.new_this_month}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Review Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Statistiche Recensioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Recensioni Totali</span>
              <Badge variant="secondary">{reviewStats.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Approvate</span>
              <Badge variant="outline">{reviewStats.approved}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>In Attesa</span>
              <Badge variant="outline">{reviewStats.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Rating Medio</span>
              <Badge variant="default">{reviewStats.average_rating.toFixed(1)} ⭐</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tour Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tour Più Popolari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tourStats.most_booked.length > 0 ? (
              tourStats.most_booked.map((tour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="truncate max-w-[200px]" title={tour.name}>
                    {tour.name}
                  </span>
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {tour.bookings} prenotazioni
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Nessuna prenotazione ancora</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Dettaglio Incassi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Incasso Confermato</span>
              <Badge variant="secondary">€{revenueStats.paid.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>In Attesa</span>
              <Badge variant="outline">€{revenueStats.pending.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Questo Mese</span>
              <Badge variant="default">€{revenueStats.this_month.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Mese Scorso</span>
              <Badge variant="outline">€{revenueStats.last_month.toLocaleString()}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
