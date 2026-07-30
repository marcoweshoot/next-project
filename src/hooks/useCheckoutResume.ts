'use client'

import { useEffect, useState } from 'react'
import { loadCheckoutDraft, clearCheckoutDraft, type CheckoutPaymentType } from '@/utils/checkoutDraft'

export interface CheckoutResumeState {
  initialStep: 2 | 3
  quantity: number
  paymentType: CheckoutPaymentType
}

export const useCheckoutResume = (sessionId: string) => {
  const [shouldOpen, setShouldOpen] = useState(false)
  const [resumeState, setResumeState] = useState<CheckoutResumeState | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') !== 'resume') return

    const draft = loadCheckoutDraft()
    if (!draft || draft.sessionId !== sessionId) {
      params.delete('checkout')
      const query = params.toString()
      const nextUrl = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname
      window.history.replaceState({}, '', nextUrl)
      return
    }

    setResumeState({
      initialStep: draft.resumeStep,
      quantity: draft.quantity,
      paymentType: draft.paymentType,
    })
    setShouldOpen(true)
    clearCheckoutDraft()

    params.delete('checkout')
    const query = params.toString()
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname
    window.history.replaceState({}, '', nextUrl)
  }, [sessionId])

  const clearResume = () => {
    setShouldOpen(false)
    setResumeState(null)
  }

  return { shouldOpen, resumeState, clearResume, setShouldOpen }
}
