'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CheckoutPaymentType } from '@/utils/checkoutDraft'

interface CheckoutStepperProps {
  currentStep: 1 | 2
}

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => (
  <div
    className="flex items-center justify-center gap-2 sm:gap-3 py-2"
    aria-label="Progresso checkout"
  >
    <div
      className={cn(
        'flex items-center gap-1.5',
        currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
          currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        1
      </div>
      <span className="text-xs hidden sm:inline">Dettagli</span>
    </div>
    <div className={cn('w-6 sm:w-10 h-px', currentStep >= 2 ? 'bg-primary' : 'bg-border')} />
    <div
      className={cn(
        'flex items-center gap-1.5',
        currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
          currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        2
      </div>
      <span className="text-xs hidden sm:inline">Pagamento</span>
    </div>
  </div>
)

interface CheckoutTripSummaryProps {
  title: string
  startDate: string
  coach: string
  availableSpots: number
}

const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

export const CheckoutTripSummary = ({
  title,
  startDate,
  coach,
  availableSpots,
}: CheckoutTripSummaryProps) => (
  <div className="space-y-1.5 pb-4 border-b border-border">
    <h3 className="text-base font-semibold leading-snug line-clamp-2 text-balance">{title}</h3>
    <p className="text-sm text-muted-foreground">
      {formatShortDate(startDate)} · {coach} · {availableSpots}{' '}
      {availableSpots === 1 ? 'posto' : 'posti'}
    </p>
  </div>
)

interface CheckoutParticipantsProps {
  quantity: number
  availableSpots: number
  onQuantityChange: (quantity: number) => void
}

export const CheckoutParticipants = ({
  quantity,
  availableSpots,
  onQuantityChange,
}: CheckoutParticipantsProps) => (
  <div className="space-y-2 py-4 border-b border-border">
    <Label htmlFor="checkout-participants" className="text-sm text-muted-foreground">
      Partecipanti
    </Label>
    <Select
      value={quantity.toString()}
      onValueChange={(value) => onQuantityChange(parseInt(value, 10))}
    >
      <SelectTrigger id="checkout-participants" className="w-full sm:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: Math.min(availableSpots, 10) }, (_, i) => i + 1).map((num) => (
          <SelectItem key={num} value={num.toString()}>
            {num} {num === 1 ? 'persona' : 'persone'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

interface CheckoutPaymentModeProps {
  paymentType: CheckoutPaymentType
  depositAmount: number
  totalAmount: number
  balanceAmount: number
  onPaymentTypeChange: (type: CheckoutPaymentType) => void
}

export const CheckoutPaymentMode = ({
  paymentType,
  depositAmount,
  totalAmount,
  balanceAmount,
  onPaymentTypeChange,
}: CheckoutPaymentModeProps) => (
  <div className="space-y-2 py-4 border-b border-border">
    <Label className="text-sm text-muted-foreground">Modalità di pagamento</Label>
    <RadioGroup
      value={paymentType}
      onValueChange={(value) => onPaymentTypeChange(value as CheckoutPaymentType)}
      className="grid grid-cols-2 gap-2"
    >
      <label
        htmlFor="payment-deposit"
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border px-3 py-3 cursor-pointer transition-colors text-center',
          paymentType === 'deposit'
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/40'
        )}
      >
        <RadioGroupItem value="deposit" id="payment-deposit" className="sr-only" />
        <span className="text-sm font-medium">Acconto</span>
        <span className="text-base font-semibold text-primary">{depositAmount}€</span>
      </label>
      <label
        htmlFor="payment-full"
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border px-3 py-3 cursor-pointer transition-colors text-center',
          paymentType === 'full'
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/40'
        )}
      >
        <RadioGroupItem value="full" id="payment-full" className="sr-only" />
        <span className="text-sm font-medium">Completo</span>
        <span className="text-base font-semibold text-primary">{totalAmount}€</span>
      </label>
    </RadioGroup>
    {paymentType === 'deposit' && (
      <p className="text-xs text-muted-foreground">
        Saldo {balanceAmount}€ entro 30 giorni dalla partenza
      </p>
    )}
  </div>
)

interface CheckoutOrderRecapProps {
  quantity: number
  isBalancePayment: boolean
  paymentType: CheckoutPaymentType
  paymentAmount: number
}

export const CheckoutOrderRecap = ({
  quantity,
  isBalancePayment,
  paymentType,
  paymentAmount,
}: CheckoutOrderRecapProps) => {
  const seatsLabel = `${quantity} ${quantity === 1 ? 'posto' : 'posti'}`
  const modeLabel = isBalancePayment
    ? 'Saldo rimanente'
    : paymentType === 'deposit'
      ? 'Acconto'
      : 'Pagamento completo'

  return (
    <p className="text-sm text-muted-foreground pb-4 border-b border-border">
      {seatsLabel} · {modeLabel} ·{' '}
      <span className="font-semibold text-foreground">{paymentAmount}€</span>
    </p>
  )
}

interface CheckoutFooterProps {
  totalLabel: string
  totalAmount: number
  primaryLabel: string
  onPrimary: () => void
  onCancel: () => void
  showTotal?: boolean
}

export const CheckoutFooter = ({
  totalLabel,
  totalAmount,
  primaryLabel,
  onPrimary,
  onCancel,
  showTotal = true,
}: CheckoutFooterProps) => (
  <div className="pt-4 space-y-3">
    {showTotal && (
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{totalLabel}</span>
        <span className="text-2xl font-bold text-primary">{totalAmount}€</span>
      </div>
    )}
    <div className="flex gap-3">
      <Button variant="outline" onClick={onCancel} className="flex-1">
        Annulla
      </Button>
      <Button onClick={onPrimary} className="flex-1">
        {primaryLabel}
      </Button>
    </div>
  </div>
)
