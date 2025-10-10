'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Calendar, 
  Euro, 
  Users, 
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Booking {
  id: string
  user_id: string
  tour_id: string
  session_id: string
  quantity: number
  status: 'pending' | 'deposit_paid' | 'fully_paid' | 'completed' | 'cancelled'
  deposit_amount: number
  total_amount: number
  stripe_payment_intent_id?: string
  stripe_deposit_intent_id?: string
  deposit_due_date?: string
  balance_due_date?: string
  tour_title?: string
  tour_destination?: string
  session_date?: string
  session_end_date?: string
  created_at: string
  updated_at: string
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    mobile_phone?: string
    address?: string
    city?: string
    postal_code?: string
    country?: string
    fiscal_code?: string
    vat_number?: string
  }
}

interface BookingStats {
  total: number
  pending: number
  deposit_paid: number
  fully_paid: number
  completed: number
  cancelled: number
  total_revenue: number
  pending_revenue: number
}

export function BookingsAdminList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)
  
  // const supabase = createClient() // Non più necessario - usiamo API route

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/bookings')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore nel caricamento delle prenotazioni')
      }

      setBookings(result.bookings || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle prenotazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return

    try {
      setActionLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore nell\'aggiornamento dello status')
      }

      setSuccess(`Status aggiornato a: ${newStatus}`)
      setStatusDialogOpen(false)
      fetchBookings()
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento dello status')
    } finally {
      setActionLoading(false)
    }
  }

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setStatusDialogOpen(true)
  }

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        booking.profiles?.first_name?.toLowerCase().includes(searchLower) ||
        booking.profiles?.last_name?.toLowerCase().includes(searchLower) ||
        booking.profiles?.email?.toLowerCase().includes(searchLower) ||
        booking.tour_title?.toLowerCase().includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower)

      if (searchQuery && !matchesSearch) return false

      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false

      // Date filter
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.created_at)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today': {
            if (bookingDate.toDateString() !== now.toDateString()) return false
            break
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (bookingDate < weekAgo) return false
            break
          }
          case 'month': {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            if (bookingDate < monthAgo) return false
            break
          }
        }
      }

      return true
    })
  }, [bookings, searchQuery, statusFilter, dateFilter])

  // Statistics
  const stats: BookingStats = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      acc.total++
      acc[booking.status]++
      acc.total_revenue += booking.total_amount || 0
      
      if (booking.status === 'pending' || booking.status === 'deposit_paid') {
        acc.pending_revenue += (booking.total_amount || 0) - (booking.deposit_amount || 0)
      }
      
      return acc
    }, {
      total: 0,
      pending: 0,
      deposit_paid: 0,
      fully_paid: 0,
      completed: 0,
      cancelled: 0,
      total_revenue: 0,
      pending_revenue: 0,
    })
  }, [filteredBookings])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { icon: Clock, text: 'In Attesa', className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-500/30' },
      deposit_paid: { icon: CheckCircle, text: 'Acconto Pagato', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30' },
      fully_paid: { icon: CheckCircle, text: 'Pagato', className: 'bg-green-500/15 text-green-700 dark:text-green-300 ring-1 ring-green-500/30' },
      completed: { icon: CheckCircle, text: 'Completato', className: 'bg-green-600/15 text-green-800 dark:text-green-200 ring-1 ring-green-600/30' },
      cancelled: { icon: XCircle, text: 'Cancellato', className: 'bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-500/30' },
    }

    const variant = variants[status as keyof typeof variants] || variants.pending
    const Icon = variant.icon

    return (
      <Badge className={`flex items-center gap-1 ${variant.className}`}>
        <Icon className="w-3 h-3" />
        {variant.text}
      </Badge>
    )
  }

  const exportToCSV = () => {
    const headers = [
      'ID Prenotazione',
      'Data Prenotazione',
      'Nome',
      'Cognome',
      'Email',
      'Telefono',
      'Città',
      'Tour',
      'Data Viaggio',
      'Partecipanti',
      'Status',
      'Acconto (€)',
      'Totale (€)',
      'Saldo da Pagare (€)'
    ]

    const rows = filteredBookings.map(booking => [
      booking.id,
      format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm'),
      booking.profiles?.first_name || '',
      booking.profiles?.last_name || '',
      booking.profiles?.email || '',
      booking.profiles?.phone || booking.profiles?.mobile_phone || '',
      booking.profiles?.city || '',
      booking.tour_title || '',
      booking.session_date ? format(new Date(booking.session_date), 'dd/MM/yyyy') : '',
      booking.quantity || 1,
      booking.status,
      (booking.deposit_amount / 100).toFixed(2),
      (booking.total_amount / 100).toFixed(2),
      ((booking.total_amount - booking.deposit_amount) / 100).toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `prenotazioni_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Prenotazioni</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} completate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasso Totale</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(stats.total_revenue / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Da {stats.total} prenotazioni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo in Sospeso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(stats.pending_revenue / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.deposit_paid} con acconto pagato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Da confermare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prenotazioni</CardTitle>
              <CardDescription>
                {filteredBookings.length} {filteredBookings.length === 1 ? 'prenotazione' : 'prenotazioni'}
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' ? ' filtrate' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtri
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredBookings.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cerca per nome, email, tour..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In Attesa</option>
                <option value="deposit_paid">Acconto Pagato</option>
                <option value="fully_paid">Pagato Completamente</option>
                <option value="completed">Completato</option>
                <option value="cancelled">Cancellato</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tutte le date</option>
                <option value="today">Oggi</option>
                <option value="week">Ultima settimana</option>
                <option value="month">Ultimo mese</option>
              </select>
            </div>

            {/* Active filters display */}
            {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtri attivi:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Cerca: {searchQuery}
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Stato: {statusFilter}
                    <button onClick={() => setStatusFilter('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {dateFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Data: {dateFilter}
                    <button onClick={() => setDateFilter('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nessuna prenotazione trovata
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Non ci sono ancora prenotazioni nel sistema'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {booking.profiles?.first_name} {booking.profiles?.last_name}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Prenotato il {format(new Date(booking.created_at), 'dd MMM yyyy', { locale: it })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{booking.quantity || 1} {booking.quantity === 1 ? 'partecipante' : 'partecipanti'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                  >
                    {expandedBooking === booking.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Tour Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium mb-1">Tour</p>
                    <p className="text-sm text-muted-foreground">{booking.tour_title || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Data Viaggio</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.session_date
                        ? `${format(new Date(booking.session_date), 'dd MMM yyyy', { locale: it })}${
                            booking.session_end_date
                              ? ` - ${format(new Date(booking.session_end_date), 'dd MMM yyyy', { locale: it })}`
                              : ''
                          }`
                        : 'N/D'}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Acconto</p>
                      <p className="font-semibold">€{(booking.deposit_amount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Totale</p>
                      <p className="font-semibold">€{(booking.total_amount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Saldo</p>
                      <p className="font-semibold">
                        €{((booking.total_amount - booking.deposit_amount) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBooking === booking.id && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Informazioni Contatto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm">{booking.profiles?.email || 'N/D'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Telefono</p>
                            <p className="text-sm">
                              {booking.profiles?.phone || booking.profiles?.mobile_phone || 'N/D'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Indirizzo</p>
                            <p className="text-sm">
                              {booking.profiles?.address
                                ? `${booking.profiles.address}${
                                    booking.profiles.city ? `, ${booking.profiles.city}` : ''
                                  }${booking.profiles.postal_code ? ` ${booking.profiles.postal_code}` : ''}`
                                : 'N/D'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Codice Fiscale</p>
                            <p className="text-sm">{booking.profiles?.fiscal_code || 'N/D'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Info */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Dettagli Tecnici
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">ID Prenotazione:</span>
                          <span className="ml-2 font-mono text-xs">{booking.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ID Utente:</span>
                          <span className="ml-2 font-mono text-xs">{booking.user_id}</span>
                        </div>
                        {booking.stripe_payment_intent_id && (
                          <div>
                            <span className="text-muted-foreground">Stripe Payment ID:</span>
                            <span className="ml-2 font-mono text-xs">{booking.stripe_payment_intent_id}</span>
                          </div>
                        )}
                        {booking.balance_due_date && (
                          <div>
                            <span className="text-muted-foreground">Scadenza Saldo:</span>
                            <span className="ml-2">
                              {format(new Date(booking.balance_due_date), 'dd MMM yyyy', { locale: it })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t flex-wrap">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openStatusDialog(booking)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Cambia Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (booking.profiles?.email) {
                            window.location.href = `mailto:${booking.profiles.email}`
                          }
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Invia Email
                      </Button>
                      {(booking.profiles?.phone || booking.profiles?.mobile_phone) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const phone = booking.profiles?.phone || booking.profiles?.mobile_phone
                            if (phone) {
                              window.location.href = `tel:${phone}`
                            }
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Chiama
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambia Status Prenotazione</DialogTitle>
            <DialogDescription>
              Modifica lo status della prenotazione di {selectedBooking?.profiles?.first_name} {selectedBooking?.profiles?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nuovo Status</Label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="pending">In Attesa</option>
                <option value="deposit_paid">Acconto Pagato</option>
                <option value="fully_paid">Pagato Completamente</option>
                <option value="completed">Completato</option>
                <option value="cancelled">Cancellato</option>
              </select>
            </div>
            
            {selectedBooking && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Status attuale:</strong> {selectedBooking.status}</p>
                <p><strong>Tour:</strong> {selectedBooking.tour_title}</p>
                <p><strong>Totale:</strong> €{(selectedBooking.total_amount / 100).toFixed(2)}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={actionLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={actionLoading || newStatus === selectedBooking?.status}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Conferma
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

