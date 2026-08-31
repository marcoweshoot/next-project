'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PromoDateCard, type PromoSession } from './PromoDateCard'

interface PromoSessionsProps {
  sessions: PromoSession[]
}

export function PromoSessions({ sessions }: PromoSessionsProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)
      } catch {
        // Il checkout come ospite funziona: proseguiamo senza utente.
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    const sessionIds = sessions.map((s) => s.id).filter(Boolean).join(',')
    if (!sessionIds) return

    fetch(`/api/sessions/availability?ids=${sessionIds}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.availability) setAvailabilityMap(data.availability)
      })
      .catch(() => {
        // Fallback silenzioso: senza dati mostriamo la capienza piena.
      })
  }, [sessions])

  if (sessions.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {sessions.map((session) => (
        <PromoDateCard
          key={session.id}
          session={session}
          bookedSpots={availabilityMap[session.id] ?? 0}
          userId={userId}
        />
      ))}
    </div>
  )
}
