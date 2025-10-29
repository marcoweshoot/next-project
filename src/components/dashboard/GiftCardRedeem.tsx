'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Gift, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/giftCards'

interface GiftCardRedeemProps {
  onGiftCardAdded?: () => void
}

export function GiftCardRedeem({ onGiftCardAdded }: GiftCardRedeemProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [giftCardInfo, setGiftCardInfo] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Inserisci un codice gift card')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate the gift card code
      const response = await fetch('/api/gift-cards/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        setError(data.error || 'Codice non valido')
        return
      }

      if (!user) {
        setError('Utente non autenticato')
        return
      }

      // Associate the gift card with the user
      const associateResponse = await fetch('/api/gift-cards/associate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          giftCardCode: code.trim().toUpperCase(),
          userId: user.id
        })
      })

      const associateData = await associateResponse.json()

      if (!associateResponse.ok || !associateData.success) {
        setError(associateData.error || 'Errore nell\'associazione della gift card')
        return
      }

      setSuccess(true)
      setGiftCardInfo(data.giftCard)
      setCode('')
      
      // Notify parent component
      if (onGiftCardAdded) {
        onGiftCardAdded()
      }

    } catch (err) {
      setError('Errore nella validazione del codice')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleRedeem()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Riscatta il tuo Regalo
        </CardTitle>
        <CardDescription>
          Inserisci il codice della tua gift card per associarla al tuo account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && giftCardInfo && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Gift card associata con successo!</strong><br />
              Codice: <code className="bg-green-100 px-2 py-1 rounded font-mono">{giftCardInfo.code}</code><br />
              Saldo: <strong>{formatCurrency(giftCardInfo.remaining_balance)}</strong>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="gift-card-code">Codice Gift Card</Label>
          <Input
            id="gift-card-code"
            type="text"
            placeholder="Inserisci il codice a 12 caratteri"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength={12}
            className="font-mono text-lg tracking-wider"
          />
          <p className="text-sm text-muted-foreground">
            Il codice è composto da 12 caratteri (lettere e numeri)
          </p>
        </div>

        <Button 
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validazione...
            </>
          ) : (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Riscatta Gift Card
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
