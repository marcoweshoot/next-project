'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Copy, Check, Calendar, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/giftCards'
import type { GiftCard } from '@/lib/giftCards'

export function UserGiftCards() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchGiftCards()
  }, [])

  const fetchGiftCards = async () => {
    try {
      const response = await fetch('/api/gift-cards/user')
      const data = await response.json()
      
      if (response.ok) {
        setGiftCards(data.giftCards || [])
      }
    } catch (error) {
      // Error fetching gift cards
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      // Error copying code
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Attiva</Badge>
      case 'used':
        return <Badge variant="secondary">Utilizzata</Badge>
      case 'expired':
        return <Badge variant="destructive">Scaduta</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Annullata</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Le Mie Gift Card
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Le Mie Gift Card
        </CardTitle>
        <CardDescription>
          Visualizza e gestisci le tue carte regalo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {giftCards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Non hai ancora gift card</p>
            <Button asChild variant="link" className="mt-2">
              <a href="/gift-card">Acquista una gift card</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {giftCards.map((giftCard) => (
              <div
                key={giftCard.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Gift Card WeShoot</span>
                  </div>
                  {getStatusBadge(giftCard.status)}
                </div>

                {/* Amount */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(giftCard.remaining_balance)}
                  </span>
                  {giftCard.remaining_balance < giftCard.amount && (
                    <span className="text-sm text-muted-foreground">
                      di {formatCurrency(giftCard.amount)}
                    </span>
                  )}
                </div>

                {/* Code */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="flex-1 font-mono text-sm font-semibold">
                    {giftCard.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(giftCard.code)}
                    className="shrink-0"
                  >
                    {copiedCode === giftCard.code ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiato
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copia
                      </>
                    )}
                  </Button>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Creata il {new Date(giftCard.created_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  {giftCard.expires_at && (
                    <span>
                      Scade il {new Date(giftCard.expires_at).toLocaleDateString('it-IT')}
                    </span>
                  )}
                </div>

                {/* Usage indicator */}
                {giftCard.remaining_balance < giftCard.amount && giftCard.remaining_balance > 0 && (
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(giftCard.remaining_balance / giftCard.amount) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {Math.round((giftCard.remaining_balance / giftCard.amount) * 100)}% disponibile
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

