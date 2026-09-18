import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { GiftCardsAdminDashboard } from '@/components/admin/GiftCardsAdminDashboard'
import { getGiftCardEffectiveStatus, type GiftCard } from '@/lib/giftCards'
import type {
  GiftCardAdminRow,
  GiftCardAdminTransaction,
  GiftCardPerson,
} from '@/components/admin/GiftCardsAdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminGiftCardsPage() {
  const supabase = await createServerClientSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verifica se l'utente è admin
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  if (error || !roles || roles.length === 0) {
    redirect('/dashboard')
  }

  const isAdmin = roles.some(role =>
    role.role === 'admin' || role.role === 'super_admin'
  )

  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Service role: le RLS su gift_cards mostrano solo le card dell'utente
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: giftCards }, { data: transactions }] = await Promise.all([
    adminSupabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('gift_card_transactions')
      .select(`
        id,
        gift_card_id,
        booking_id,
        user_id,
        amount_used,
        created_at,
        bookings(id, tour_title, tour_destination, session_date, status)
      `)
      .order('created_at', { ascending: false }),
  ])

  type JoinedBooking = {
    id: string
    tour_title: string | null
    tour_destination: string | null
    session_date: string | null
    status: string | null
  }
  type RawTransaction = {
    id: string
    gift_card_id: string
    booking_id: string | null
    user_id: string | null
    amount_used: number
    created_at: string
    // I tipi generati da Supabase vedono il join come array, a runtime con la FK è un oggetto
    bookings: JoinedBooking | JoinedBooking[] | null
  }

  const cards = (giftCards || []) as GiftCard[]
  const txs = (transactions || []) as unknown as RawTransaction[]
  const joinedBooking = (b: RawTransaction['bookings']): JoinedBooking | null =>
    Array.isArray(b) ? b[0] ?? null : b

  // Profili di acquirenti, riscattatori e utenti delle transazioni, in una sola query
  const userIds = Array.from(
    new Set(
      [
        ...cards.map(c => c.purchaser_user_id),
        ...cards.map(c => c.redeemed_by_user_id),
        ...txs.map(t => t.user_id),
      ].filter((id): id is string => Boolean(id))
    )
  )

  const people = new Map<string, GiftCardPerson>()
  if (userIds.length > 0) {
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)

    for (const p of profiles || []) {
      people.set(p.id, {
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || null,
        email: p.email ?? null,
      })
    }
  }

  const txByCard = new Map<string, GiftCardAdminTransaction[]>()
  for (const t of txs) {
    const list = txByCard.get(t.gift_card_id) ?? []
    list.push({
      id: t.id,
      amount_used: t.amount_used,
      created_at: t.created_at,
      user: t.user_id ? people.get(t.user_id) ?? null : null,
      booking: joinedBooking(t.bookings),
    })
    txByCard.set(t.gift_card_id, list)
  }

  const now = new Date()
  const rows: GiftCardAdminRow[] = cards.map(card => ({
    ...card,
    effectiveStatus: getGiftCardEffectiveStatus(card, now),
    purchaser: card.purchaser_user_id ? people.get(card.purchaser_user_id) ?? null : null,
    redeemer: card.redeemed_by_user_id ? people.get(card.redeemed_by_user_id) ?? null : null,
    transactions: txByCard.get(card.id) ?? [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gift Card</h2>
        <p className="text-muted-foreground">
          Tutte le gift card vendute: saldo, utilizzi e scadenze
        </p>
      </div>

      <GiftCardsAdminDashboard cards={rows} generatedAt={now.toISOString()} />
    </div>
  )
}
