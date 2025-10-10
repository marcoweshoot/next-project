'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText
} from 'lucide-react'
import { FinancialCharts } from './FinancialCharts'
import { format } from 'date-fns'

interface BookingData {
  id: string
  status: string
  total_amount: number
  deposit_amount: number
  created_at: string
}

interface StatisticsClientProps {
  bookingStats: {
    total: number
    paid: number
    pending: number
    refunded: number
  }
  revenueStats: {
    total: number
    paid: number
    pending: number
    this_month: number
    last_month: number
  }
  userStats: {
    total: number
    active: number
    new_this_month: number
  }
  reviewStats: {
    total: number
    approved: number
    pending: number
    average_rating: number
  }
  tourStats: {
    total: number
    most_booked: Array<{name: string, bookings: number}>
  }
  bookingsData: BookingData[]
}

export function StatisticsClient({
  bookingStats,
  revenueStats,
  userStats,
  reviewStats,
  tourStats,
  bookingsData
}: StatisticsClientProps) {
  const revenueGrowth = revenueStats.last_month > 0 
    ? ((revenueStats.this_month - revenueStats.last_month) / revenueStats.last_month * 100)
    : 0

  const exportStatisticsCSV = () => {
    const data = [
      ['Statistiche Generali', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [],
      ['PRENOTAZIONI'],
      ['Totale', bookingStats.total],
      ['Pagate', bookingStats.paid],
      ['In Attesa', bookingStats.pending],
      ['Cancellate', bookingStats.cancelled],
      [],
      ['REVENUE'],
      ['Totale', `€${(revenueStats.total / 100).toFixed(2)}`],
      ['Confermato', `€${(revenueStats.paid / 100).toFixed(2)}`],
      ['In Attesa', `€${(revenueStats.pending / 100).toFixed(2)}`],
      ['Questo Mese', `€${(revenueStats.this_month / 100).toFixed(2)}`],
      ['Mese Scorso', `€${(revenueStats.last_month / 100).toFixed(2)}`],
      ['Crescita', `${revenueGrowth.toFixed(1)}%`],
      [],
      ['UTENTI'],
      ['Totale', userStats.total],
      ['Attivi (30gg)', userStats.active],
      ['Nuovi questo mese', userStats.new_this_month],
      [],
      ['RECENSIONI'],
      ['Totale', reviewStats.total],
      ['Approvate', reviewStats.approved],
      ['In Attesa', reviewStats.pending],
      ['Rating Medio', reviewStats.average_rating.toFixed(1)],
      [],
      ['TOUR PIÙ POPOLARI'],
      ...tourStats.most_booked.map(tour => [tour.name, tour.bookings])
    ]

    const csvContent = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `statistiche_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Statistiche Generali</h2>
        </div>
        <Button onClick={exportStatisticsCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Esporta Report CSV
        </Button>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasso Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(revenueStats.total / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              €{(revenueStats.paid / 100).toLocaleString()} confermati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasso Questo Mese</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(revenueStats.this_month / 100).toLocaleString()}</div>
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
            <div className="text-2xl font-bold">€{(revenueStats.pending / 100).toLocaleString()}</div>
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

      {/* Financial Charts */}
      <FinancialCharts bookings={bookingsData} />

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
              <Badge variant="secondary">€{(revenueStats.paid / 100).toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>In Attesa</span>
              <Badge variant="outline">€{(revenueStats.pending / 100).toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Questo Mese</span>
              <Badge variant="default">€{(revenueStats.this_month / 100).toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Mese Scorso</span>
              <Badge variant="outline">€{(revenueStats.last_month / 100).toLocaleString()}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

