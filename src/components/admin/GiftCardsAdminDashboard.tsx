'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format, differenceInCalendarDays } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Gift,
  Search,
  Download,
  Copy,
  Check,
  ExternalLink,
  CalendarClock,
  Wallet,
  TicketCheck,
  Mail,
  User,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatGiftCardCode,
  GIFT_CARD_EXPIRING_DAYS,
  type GiftCard,
  type GiftCardEffectiveStatus,
} from '@/lib/giftCards'

export interface GiftCardPerson {
  id: string
  name: string | null
  email: string | null
}

export interface GiftCardAdminTransaction {
  id: string
  amount_used: number
  created_at: string
  user: GiftCardPerson | null
  booking: {
    id: string
    tour_title: string | null
    tour_destination: string | null
    session_date: string | null
    status: string | null
  } | null
}

export interface GiftCardAdminRow extends GiftCard {
  effectiveStatus: GiftCardEffectiveStatus
  purchaser: GiftCardPerson | null
  redeemer: GiftCardPerson | null
  transactions: GiftCardAdminTransaction[]
}

type StatusFilter = 'all' | GiftCardEffectiveStatus
type SortKey = 'recent' | 'expiry' | 'balance'

const STATUS_META: Record<
  GiftCardEffectiveStatus,
  { label: string; description: string; dot: string; badge: string }
> = {
  active: {
    label: 'Attiva',
    description: 'Saldo intero, ancora da utilizzare.',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  },
  partial: {
    label: 'Parziale',
    description: 'Usata in parte, con saldo residuo disponibile.',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  },
  expiring: {
    label: 'In scadenza',
    description: `Scade entro ${GIFT_CARD_EXPIRING_DAYS} giorni e ha ancora saldo.`,
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  },
  used: {
    label: 'Usata',
    description: 'Saldo esaurito.',
    dot: 'bg-zinc-400',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  },
  expired: {
    label: 'Scaduta',
    description: 'Data di scadenza superata con saldo non utilizzato.',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
  },
  cancelled: {
    label: 'Annullata',
    description: 'Annullata manualmente, non più spendibile.',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
  },
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tutte' },
  { key: 'active', label: 'Attive' },
  { key: 'partial', label: 'Parziali' },
  { key: 'expiring', label: 'In scadenza' },
  { key: 'used', label: 'Usate' },
  { key: 'expired', label: 'Scadute' },
  { key: 'cancelled', label: 'Annullate' },
]

const SPENDABLE: GiftCardEffectiveStatus[] = ['active', 'partial', 'expiring']

function formatDate(value: string | null | undefined, pattern = 'd MMM yyyy') {
  if (!value) return '—'
  return format(new Date(value), pattern, { locale: it })
}

function personLabel(person: GiftCardPerson | null, fallback = '—') {
  if (!person) return fallback
  return person.name || person.email || fallback
}

function StatusBadge({ status }: { status: GiftCardEffectiveStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 rounded-full px-2.5 py-0.5 font-medium', meta.badge)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </Badge>
  )
}

function ExpiryLabel({ card, now }: { card: GiftCardAdminRow; now: Date }) {
  if (!card.expires_at) return <span className="text-muted-foreground">Nessuna</span>
  const days = differenceInCalendarDays(new Date(card.expires_at), now)
  const spendable = SPENDABLE.includes(card.effectiveStatus)
  return (
    <div className="leading-tight">
      <div className={cn(days < 0 && spendable && 'text-rose-600')}>
        {formatDate(card.expires_at)}
      </div>
      {spendable && days >= 0 && days <= GIFT_CARD_EXPIRING_DAYS && (
        <div className="text-xs text-amber-600">
          {days === 0 ? 'oggi' : days === 1 ? 'domani' : `tra ${days} giorni`}
        </div>
      )}
      {spendable && days < 0 && (
        <div className="text-xs text-rose-600">{Math.abs(days)} giorni fa</div>
      )}
    </div>
  )
}

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
  tone?: 'default' | 'warning'
}) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        tone === 'warning' && 'bg-amber-50/70 dark:bg-amber-950/20'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <Icon className={cn('h-4 w-4', tone === 'warning' && 'text-amber-600')} />
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  )
}

export function GiftCardsAdminDashboard({
  cards,
  generatedAt,
}: {
  cards: GiftCardAdminRow[]
  generatedAt: string
}) {
  const now = useMemo(() => new Date(generatedAt), [generatedAt])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: cards.length,
      active: 0,
      partial: 0,
      expiring: 0,
      used: 0,
      expired: 0,
      cancelled: 0,
    }
    for (const card of cards) c[card.effectiveStatus]++
    return c
  }, [cards])

  const kpi = useMemo(() => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const spendable = cards.filter(c => SPENDABLE.includes(c.effectiveStatus))
    const sold = cards.filter(c => c.effectiveStatus !== 'cancelled')
    const soldValue = sold.reduce((s, c) => s + c.amount, 0)
    const usedValue = sold.reduce((s, c) => s + (c.amount - c.remaining_balance), 0)
    const thisMonth = sold.filter(c => new Date(c.created_at) >= monthStart)
    const usedThisMonth = cards
      .flatMap(c => c.transactions)
      .filter(t => new Date(t.created_at) >= monthStart)
      .reduce((s, t) => s + t.amount_used, 0)
    const expiring = cards.filter(c => c.effectiveStatus === 'expiring')

    return {
      circulating: spendable.reduce((s, c) => s + c.remaining_balance, 0),
      circulatingCount: spendable.length,
      soldCount: sold.length,
      soldValue,
      thisMonthCount: thisMonth.length,
      thisMonthValue: thisMonth.reduce((s, c) => s + c.amount, 0),
      usedValue,
      usedPct: soldValue > 0 ? Math.round((usedValue / soldValue) * 100) : 0,
      usedThisMonth,
      expiringCount: expiring.length,
      expiringValue: expiring.reduce((s, c) => s + c.remaining_balance, 0),
    }
  }, [cards, now])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qCode = q.replace(/-/g, '')

    let list = cards.filter(c => filter === 'all' || c.effectiveStatus === filter)

    if (q) {
      list = list.filter(c => {
        const haystack = [
          c.recipient_email,
          c.purchaser?.name,
          c.purchaser?.email,
          c.redeemer?.name,
          c.redeemer?.email,
          ...c.transactions.map(t => t.booking?.tour_title),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return (qCode && c.code.toLowerCase().includes(qCode)) || haystack.includes(q)
      })
    }

    const byExpiry = (c: GiftCardAdminRow) =>
      c.expires_at ? new Date(c.expires_at).getTime() : Number.POSITIVE_INFINITY

    return [...list].sort((a, b) => {
      if (sort === 'expiry') return byExpiry(a) - byExpiry(b)
      if (sort === 'balance') return b.remaining_balance - a.remaining_balance
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [cards, filter, query, sort])

  const selected = selectedId ? cards.find(c => c.id === selectedId) ?? null : null

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // clipboard non disponibile
    }
  }

  const exportToCSV = () => {
    const esc = (v: string | number | null | undefined) => {
      const s = v == null ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows: (string | number | null | undefined)[][] = [
      [
        'Codice',
        'Stato',
        'Importo (€)',
        'Saldo (€)',
        'Usato (€)',
        'Destinatario',
        'Acquirente',
        'Riscattata da',
        'Acquistata il',
        'Scade il',
        'Utilizzi',
        'Stripe Payment Intent',
      ],
      ...visible.map(c => [
        formatGiftCardCode(c.code),
        STATUS_META[c.effectiveStatus].label,
        (c.amount / 100).toFixed(2),
        (c.remaining_balance / 100).toFixed(2),
        ((c.amount - c.remaining_balance) / 100).toFixed(2),
        c.recipient_email,
        personLabel(c.purchaser, 'Guest'),
        personLabel(c.redeemer, ''),
        formatDate(c.created_at, 'yyyy-MM-dd'),
        formatDate(c.expires_at, 'yyyy-MM-dd'),
        c.transactions.length,
        c.stripe_payment_intent_id,
      ]),
    ]
    const csv = rows.map(r => r.map(esc).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gift-card_${format(now, 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          icon={Wallet}
          label="In circolazione"
          value={formatCurrency(kpi.circulating)}
          hint={`${kpi.circulatingCount} card spendibili`}
        />
        <KpiTile
          icon={Gift}
          label="Vendute"
          value={String(kpi.soldCount)}
          hint={`${formatCurrency(kpi.soldValue)} totali · ${kpi.thisMonthCount} questo mese (${formatCurrency(kpi.thisMonthValue)})`}
        />
        <KpiTile
          icon={TicketCheck}
          label="Riscattato"
          value={formatCurrency(kpi.usedValue)}
          hint={`${kpi.usedPct}% del venduto · ${formatCurrency(kpi.usedThisMonth)} questo mese`}
        />
        <KpiTile
          icon={CalendarClock}
          label={`In scadenza (${GIFT_CARD_EXPIRING_DAYS} gg)`}
          value={String(kpi.expiringCount)}
          hint={
            kpi.expiringCount > 0
              ? `${formatCurrency(kpi.expiringValue)} di saldo a rischio`
              : 'Nessuna card in scadenza'
          }
          tone={kpi.expiringCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="inline-flex gap-1 rounded-full bg-muted p-1">
            {FILTERS.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                  filter === f.key
                    ? 'bg-background font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs tabular-nums',
                    filter === f.key ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Codice, email, nome…"
              className="h-9 w-full rounded-full pl-9 sm:w-64"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
            aria-label="Ordina"
          >
            <option value="recent">Più recenti</option>
            <option value="expiry">Scadenza più vicina</option>
            <option value="balance">Saldo più alto</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full"
            onClick={exportToCSV}
            disabled={visible.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Lista */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        {visible.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Gift className="h-8 w-8 text-muted-foreground/60" />
            <p className="font-medium">Nessuna gift card</p>
            <p className="text-sm text-muted-foreground">
              {query
                ? 'Nessun risultato per la ricerca corrente.'
                : 'Non ci sono card in questo stato.'}
            </p>
          </CardContent>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Codice</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead className="w-44">Saldo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Acquistata</TableHead>
                    <TableHead className="pr-5">Scade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map(card => (
                    <TableRow
                      key={card.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(card.id)}
                    >
                      <TableCell className="pl-5">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            copyCode(card.code)
                          }}
                          className="group inline-flex items-center gap-2 font-mono text-sm tracking-wide"
                          title="Copia codice"
                        >
                          {formatGiftCardCode(card.code)}
                          {copiedCode === card.code ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {card.recipient_email || '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(card.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="text-sm tabular-nums">
                            {formatCurrency(card.remaining_balance)}
                          </div>
                          <Progress
                            value={card.amount > 0 ? (card.remaining_balance / card.amount) * 100 : 0}
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={card.effectiveStatus} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(card.created_at)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <ExpiryLabel card={card} now={now} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <ul className="divide-y md:hidden">
              {visible.map(card => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(card.id)}
                    className="flex w-full flex-col gap-2 p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm tracking-wide">
                        {formatGiftCardCode(card.code)}
                      </span>
                      <StatusBadge status={card.effectiveStatus} />
                    </div>
                    <div className="truncate text-sm text-muted-foreground">
                      {card.recipient_email || '—'}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="tabular-nums">
                        {formatCurrency(card.remaining_balance)}{' '}
                        <span className="text-muted-foreground">
                          / {formatCurrency(card.amount)}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        scade {formatDate(card.expires_at)}
                      </span>
                    </div>
                    <Progress
                      value={card.amount > 0 ? (card.remaining_balance / card.amount) * 100 : 0}
                      className="h-1"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        {visible.length} di {cards.length} gift card · aggiornato {formatDate(generatedAt, "d MMM yyyy 'alle' HH:mm")}
      </p>

      {/* Dettaglio */}
      <Sheet open={!!selected} onOpenChange={open => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <div className="space-y-6">
              <SheetHeader className="text-left">
                <SheetDescription>Gift card</SheetDescription>
                <SheetTitle className="font-mono text-2xl tracking-wider">
                  <button
                    type="button"
                    onClick={() => copyCode(selected.code)}
                    className="inline-flex items-center gap-2"
                    title="Copia codice"
                  >
                    {formatGiftCardCode(selected.code)}
                    {copiedCode === selected.code ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </SheetTitle>
                <div className="pt-1">
                  <StatusBadge status={selected.effectiveStatus} />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {STATUS_META[selected.effectiveStatus].description}
                  </p>
                </div>
              </SheetHeader>

              {/* Saldo */}
              <div className="rounded-2xl bg-muted/60 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Saldo residuo</div>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums">
                      {formatCurrency(selected.remaining_balance)}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground tabular-nums">
                    <div>di {formatCurrency(selected.amount)}</div>
                    <div>usati {formatCurrency(selected.amount - selected.remaining_balance)}</div>
                  </div>
                </div>
                <Progress
                  value={selected.amount > 0 ? (selected.remaining_balance / selected.amount) * 100 : 0}
                  className="mt-3 h-1.5"
                />
              </div>

              {/* Dettagli */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <DetailItem icon={Clock} label="Acquistata">
                  {formatDate(selected.created_at, "d MMM yyyy 'alle' HH:mm")}
                </DetailItem>
                <DetailItem icon={CalendarClock} label="Scadenza">
                  <ExpiryLabel card={selected} now={now} />
                </DetailItem>
                <DetailItem icon={Mail} label="Destinatario">
                  {selected.recipient_email || '—'}
                </DetailItem>
                <DetailItem icon={User} label="Acquirente">
                  {selected.purchaser ? (
                    <PersonLine person={selected.purchaser} />
                  ) : (
                    <span className="text-muted-foreground">Acquisto guest</span>
                  )}
                </DetailItem>
                <DetailItem icon={User} label="Riscattata da">
                  {selected.redeemer ? (
                    <PersonLine person={selected.redeemer} />
                  ) : (
                    <span className="text-muted-foreground">Nessun account associato</span>
                  )}
                </DetailItem>
                <DetailItem icon={Clock} label="Ultimo aggiornamento">
                  {formatDate(selected.updated_at, "d MMM yyyy 'alle' HH:mm")}
                </DetailItem>
              </dl>

              {/* Stripe */}
              {(selected.stripe_payment_intent_id || selected.stripe_session_id) && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {selected.stripe_payment_intent_id && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${selected.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono hover:text-foreground"
                    >
                      {selected.stripe_payment_intent_id}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selected.stripe_session_id && (
                    <div className="truncate font-mono">{selected.stripe_session_id}</div>
                  )}
                </div>
              )}

              {/* Utilizzi */}
              <div>
                <h4 className="mb-3 text-sm font-medium">
                  Utilizzi{' '}
                  <span className="text-muted-foreground">({selected.transactions.length})</span>
                </h4>
                {selected.transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nessun utilizzo registrato.</p>
                ) : (
                  <ol className="relative space-y-4 border-l pl-4">
                    {selected.transactions.map(tx => (
                      <li key={tx.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium tabular-nums">
                            −{formatCurrency(tx.amount_used)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(tx.created_at, "d MMM yyyy 'alle' HH:mm")}
                          </span>
                        </div>
                        {tx.user && (
                          <div className="text-xs text-muted-foreground">
                            <PersonLine person={tx.user} />
                          </div>
                        )}
                        {tx.booking ? (
                          <Link
                            href="/admin/bookings"
                            className="mt-1 block rounded-xl bg-muted/60 p-3 text-sm transition-colors hover:bg-muted"
                          >
                            <div className="font-medium">
                              {tx.booking.tour_title || 'Prenotazione'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {[
                                tx.booking.tour_destination,
                                tx.booking.session_date && formatDate(tx.booking.session_date),
                                tx.booking.status,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                          </Link>
                        ) : (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Nessuna prenotazione collegata
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  )
}

function PersonLine({ person }: { person: GiftCardPerson }) {
  return (
    <span>
      {person.name || person.email}
      {person.name && person.email && (
        <span className="block text-xs text-muted-foreground">{person.email}</span>
      )}
    </span>
  )
}
