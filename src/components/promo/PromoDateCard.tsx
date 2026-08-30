'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CalendarDays, Clock, Users } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/payment/StripeCheckoutButton'
import {
  PROMO_FULL_PRICE,
  PROMO_PARTY_SIZE,
  PROMO_PRICE_PER_PERSON,
  PROMO_ROMA_TOUR_ID,
} from '@/graphql/queries/promo-roma'

export interface PromoSession {
  id: string
  start: string
  end: string
  maxPax: number
  status: string
}

interface PromoDateCardProps {
  session: PromoSession
  /** Posti gia occupati per questa sessione. */
  bookedSpots: number
  userId?: string
}

const PROMO_TOTAL = PROMO_PRICE_PER_PERSON * PROMO_PARTY_SIZE
const FULL_TOTAL = PROMO_FULL_PRICE * PROMO_PARTY_SIZE
const TOUR_TITLE = 'Roma: workshop di fotografia — Porta un Amico'

function formatLongDate(value: string) {
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  const formatted = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function PromoDateCard({ session, bookedSpots, userId }: PromoDateCardProps) {
  const [error, setError] = useState<string | null>(null)

  const availableSpots = Math.max(0, session.maxPax - bookedSpots)
  const hasRoomForTwo = availableSpots >= PROMO_PARTY_SIZE
  const isLastCall = hasRoomForTwo && availableSpots <= 3

  return (
    <Card className="h-full border-2 transition-colors hover:border-primary/60">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
            <span className="font-semibold leading-tight">{formatLongDate(session.start)}</span>
          </div>
          {isLastCall && (
            <Badge variant="destructive" className="shrink-0">
              Ultimi {availableSpots} posti
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Circa 6 ore, nel pomeriggio
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {availableSpots} posti liberi su {session.maxPax}
          </span>
        </div>

        <div className="mt-auto rounded-lg bg-muted/60 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">{FULL_TOTAL}€</span>
            <span className="text-3xl font-bold text-foreground">{PROMO_TOTAL}€</span>
            <span className="text-sm text-muted-foreground">in due</span>
          </div>
          <p className="mt-1 text-sm font-medium text-primary">
            {PROMO_PRICE_PER_PERSON}€ a testa invece di {PROMO_FULL_PRICE}€
          </p>
        </div>

        {hasRoomForTwo ? (
          <StripeCheckoutButton
            amount={PROMO_TOTAL * 100}
            currency="eur"
            tourId={PROMO_ROMA_TOUR_ID}
            sessionId={session.id}
            userId={userId}
            paymentType="full"
            quantity={PROMO_PARTY_SIZE}
            tourTitle={TOUR_TITLE}
            tourDestination="Roma"
            sessionDate={session.start}
            sessionEndDate={session.end}
            // 50 e non 69: il webhook calcola total_amount = sessionPrice * 100 * quantity,
            // quindi con il prezzo pieno la prenotazione risulterebbe saldata solo in parte.
            sessionPrice={PROMO_PRICE_PER_PERSON}
            sessionDeposit={0}
            cancelReturnUrl={typeof window !== 'undefined' ? window.location.href.split('?')[0] : undefined}
            onError={setError}
          />
        ) : (
          <Badge variant="secondary" className="justify-center py-2 text-sm">
            Posti esauriti per la coppia
          </Badge>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
