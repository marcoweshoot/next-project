'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'

interface Booking {
  id: string
  status: string
  total_amount: number
  deposit_amount: number
  created_at: string
}

interface FinancialChartsProps {
  bookings: Booking[]
}

const COLORS = {
  revenue: '#10b981',
  bookings: '#3b82f6',
  pending: '#f59e0b',
  deposit_paid: '#8b5cf6',
  fully_paid: '#10b981',
  completed: '#059669',
  cancelled: '#ef4444',
}

export function FinancialCharts({ bookings }: FinancialChartsProps) {
  // Monthly revenue and bookings data
  const monthlyData = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toLocaleString('it-IT', { month: 'short', year: '2-digit' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        revenue: 0,
        bookings: 0,
      }
    })

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.created_at)
      const monthIndex = last12Months.findIndex(
        m => m.year === bookingDate.getFullYear() && m.monthIndex === bookingDate.getMonth()
      )
      
      if (monthIndex !== -1 && booking.status !== 'cancelled') {
        last12Months[monthIndex].revenue += booking.total_amount / 100
        last12Months[monthIndex].bookings += 1
      }
    })

    return last12Months
  }, [bookings])

  // Status distribution data
  const statusData = useMemo(() => {
    const distribution = bookings.reduce((acc, booking) => {
      const status = booking.status
      if (!acc[status]) {
        acc[status] = { name: status, value: 0, revenue: 0 }
      }
      acc[status].value += 1
      acc[status].revenue += booking.total_amount / 100
      return acc
    }, {} as Record<string, { name: string; value: number; revenue: number }>)

    const statusLabels: Record<string, string> = {
      pending: 'In Attesa',
      deposit_paid: 'Acconto Pagato',
      fully_paid: 'Pagato',
      completed: 'Completato',
      cancelled: 'Rimborsato',
    }

    return Object.values(distribution).map(item => ({
      ...item,
      name: statusLabels[item.name] || item.name,
      color: COLORS[item.name as keyof typeof COLORS] || '#6b7280'
    }))
  }, [bookings])

  // Weekly bookings trend (last 8 weeks)
  const weeklyData = useMemo(() => {
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (7 * (7 - i)))
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      
      return {
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        weekStart: weekStart.getTime(),
        weekEnd: weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
        bookings: 0,
      }
    })

    bookings.forEach(booking => {
      const bookingTime = new Date(booking.created_at).getTime()
      const weekIndex = last8Weeks.findIndex(
        w => bookingTime >= w.weekStart && bookingTime < w.weekEnd
      )
      
      if (weekIndex !== -1) {
        last8Weeks[weekIndex].bookings += 1
      }
    })

    return last8Weeks
  }, [bookings])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Andamento Revenue (12 mesi)
          </CardTitle>
          <CardDescription>
            Revenue totale e numero di prenotazioni per mese
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="left"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Revenue (€)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Prenotazioni', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `€${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Revenue' : 'Prenotazioni'
                ]}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke={COLORS.revenue} 
                strokeWidth={2}
                dot={{ fill: COLORS.revenue }}
                name="Revenue"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="bookings" 
                stroke={COLORS.bookings} 
                strokeWidth={2}
                dot={{ fill: COLORS.bookings }}
                name="Prenotazioni"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Bookings Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Prenotazioni Settimanali
          </CardTitle>
          <CardDescription>
            Trend prenotazioni nelle ultime 8 settimane
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => [value, 'Prenotazioni']}
              />
              <Bar dataKey="bookings" fill={COLORS.bookings} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Distribuzione per Status
          </CardTitle>
          <CardDescription>
            Numero di prenotazioni per stato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} prenotazioni (€${props.payload.revenue.toFixed(2)})`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

