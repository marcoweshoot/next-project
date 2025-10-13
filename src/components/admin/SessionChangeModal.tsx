'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, Euro, MapPin, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Session {
  id: string
  start: string
  end: string
  price: number
  deposit: number
  balance: number
  currency: string
  status: string
  maxPax: number
  tour: {
    id: string
    title: string
    slug: string
    places: any[]
    states: any[]
  }
  displayText: string
  coach: string
}

interface SessionChangeModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  currentSessionId: string
  currentTourTitle?: string
  currentSessionDate?: string
  onSessionChanged: (success: boolean, message?: string) => void
}

export function SessionChangeModal({
  isOpen,
  onClose,
  bookingId,
  currentSessionId,
  currentTourTitle,
  currentSessionDate,
  onSessionChanged
}: SessionChangeModalProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Carica le sessioni disponibili quando si apre il modal
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSessions()
    }
  }, [isOpen])

  const fetchAvailableSessions = async () => {
    try {
      setSessionsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/available-sessions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel caricamento delle sessioni')
      }

      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle sessioni')
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleSessionChange = async () => {
    if (!selectedSessionId) {
      setError('Seleziona una sessione')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const selectedSession = sessions.find(s => s.id === selectedSessionId)
      if (!selectedSession) {
        throw new Error('Sessione selezionata non trovata')
      }

      const response = await fetch(`/api/admin/bookings/${bookingId}/change-session`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newSessionId: selectedSessionId,
          newTourId: selectedSession.tour.id
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore nel cambio sessione')
      }

      // Mostra informazioni dettagliate
      const detailMessage = `Sessione cambiata con successo!

${result.message}

Dettagli finanziari:
• Importo pagato: €${result.amountPaid?.toFixed(2) || '0.00'}
• Nuovo totale: €${result.newTotal?.toFixed(2) || '0.00'}
• Saldo residuo: €${result.remainingBalance?.toFixed(2) || '0.00'}
• Nuovo deposito: €${result.newDepositAmount?.toFixed(2) || '0.00'}`

      setSuccess(detailMessage)
      
      // Chiudi il modal dopo un delay
      setTimeout(() => {
        onSessionChanged(true, result.message)
        onClose()
        setSuccess(null)
        setSelectedSessionId('')
      }, 3000)

    } catch (err) {
      console.error('Error changing session:', err)
      setError(err instanceof Error ? err.message : 'Errore nel cambio sessione')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedSessionId('')
      setError(null)
      setSuccess(null)
      onClose()
    }
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Cambia Sessione
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sessione corrente */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Sessione Attuale</h4>
            <div className="space-y-1">
              <p className="font-medium">{currentTourTitle || 'Tour da definire'}</p>
              <p className="text-sm text-muted-foreground">
                {currentSessionDate ? 
                  new Date(currentSessionDate).toLocaleDateString('it-IT') : 
                  'Data da definire'
                }
              </p>
            </div>
          </div>

          {/* Selezione nuova sessione */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Seleziona Nuova Sessione</label>
            
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Caricamento sessioni disponibili...</span>
              </div>
            ) : (
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli una sessione..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.tour.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.start).toLocaleDateString('it-IT')} - €{session.price}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Dettagli sessione selezionata */}
          {selectedSession && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">Dettagli Nuova Sessione</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedSession.start).toLocaleDateString('it-IT')} - {' '}
                      {new Date(selectedSession.end).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prezzo</p>
                    <p className="text-sm text-muted-foreground">€{selectedSession.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Destinazione</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSession.tour.places?.[0]?.name || selectedSession.tour.states?.[0]?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Coach</p>
                    <p className="text-sm text-muted-foreground">{selectedSession.coach}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={selectedSession.status === 'confirmed' ? 'default' : 'secondary'}>
                  {selectedSession.status}
                </Badge>
              </div>
            </div>
          )}

          {/* Errori e successo */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Azioni */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSessionChange}
              disabled={!selectedSessionId || loading || sessionsLoading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambia Sessione'
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Annulla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
