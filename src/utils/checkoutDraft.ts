export type CheckoutPaymentType = 'deposit' | 'full'

export interface CheckoutDraft {
  tourId: string
  sessionId: string
  quantity: number
  paymentType: CheckoutPaymentType
  returnUrl: string
  resumeStep: 2 | 3
  savedAt: number
}

const STORAGE_KEY = 'weshoot_checkout_draft'
const TTL_MS = 24 * 60 * 60 * 1000

export const buildCheckoutResumeUrl = (draft: CheckoutDraft): string => {
  const separator = draft.returnUrl.includes('?') ? '&' : '?'
  return `${draft.returnUrl}${separator}checkout=resume`
}

export const saveCheckoutDraft = (draft: Omit<CheckoutDraft, 'savedAt'>): void => {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() })
    )
  } catch {
    // Storage may be unavailable in private mode
  }
}

export const loadCheckoutDraft = (): CheckoutDraft | null => {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const draft = JSON.parse(raw) as CheckoutDraft
    if (!draft?.tourId || !draft?.sessionId || !draft?.returnUrl) return null
    if (Date.now() - draft.savedAt > TTL_MS) {
      clearCheckoutDraft()
      return null
    }

    return draft
  } catch {
    return null
  }
}

export const clearCheckoutDraft = (): void => {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export const persistCheckoutSelection = (data: {
  quantity: number
  paymentType: CheckoutPaymentType
  tourId: string
  sessionId: string
}): void => {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(
      'weshoot_checkout_selection',
      JSON.stringify({ ...data, savedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}

export const loadCheckoutSelection = (
  tourId: string,
  sessionId: string
): { quantity: number; paymentType: CheckoutPaymentType } | null => {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem('weshoot_checkout_selection')
    if (!raw) return null

    const data = JSON.parse(raw)
    if (data.tourId !== tourId || data.sessionId !== sessionId) return null
    if (Date.now() - data.savedAt > TTL_MS) return null

    return {
      quantity: data.quantity ?? 1,
      paymentType: data.paymentType ?? 'deposit',
    }
  } catch {
    return null
  }
}
