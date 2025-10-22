'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift, Check, X, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/giftCards'

interface GiftCardInputProps {
  onApply: (code: string, discount: number) => void
  onRemove: () => void
  appliedCode?: string
  appliedDiscount?: number
}

export function GiftCardInput({ 
  onApply, 
  onRemove, 
  appliedCode, 
  appliedDiscount 
}: GiftCardInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Inserisci un codice gift card')
      return
    }

    setLoading(true)
    setError(null)

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

      // Apply the gift card
      onApply(data.giftCard.code, data.giftCard.remaining_balance)
      setCode('')
    } catch (err) {
      setError('Errore nella validazione del codice')
      console.error('Error validating gift card:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    onRemove()
    setCode('')
    setError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Gift className="h-4 w-4" />
        Hai una Gift Card?
      </Label>

      {appliedCode && appliedDiscount ? (
        // Gift card applied state
        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Gift Card applicata
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Codice: {appliedCode}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                -{formatCurrency(appliedDiscount)}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-xs h-6 px-2"
              >
                Rimuovi
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Gift card input state
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError(null)
              }}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="font-mono"
              maxLength={14}
            />
            <Button
              type="button"
              onClick={handleApply}
              disabled={loading || !code.trim()}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifica...
                </>
              ) : (
                'Applica'
              )}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <X className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Inserisci il codice della tua gift card per applicare lo sconto
          </p>
        </div>
      )}
    </div>
  )
}

