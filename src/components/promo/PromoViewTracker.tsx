'use client'

import { useEffect } from 'react'
import { trackViewCategory } from '@/utils/facebook'
import { PROMO_ROMA_TOUR_ID } from '@/graphql/queries/promo-roma'

/**
 * Traccia la ViewCategory della landing promo "Porta un Amico".
 * InitiateCheckout / AddPaymentInfo / Purchase sono gia coperti
 * da StripeCheckoutButton e dalla pagina di success.
 */
export function PromoViewTracker() {
  useEffect(() => {
    trackViewCategory({
      categoryName: 'Porta un Amico — Workshop Roma',
      categoryType: 'Promo Workshop',
      contentIds: [PROMO_ROMA_TOUR_ID],
    })
  }, [])

  return null
}
