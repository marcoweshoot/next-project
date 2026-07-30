const STORAGE_KEY = 'weshoot_post_payment_claim'

export const savePostPaymentClaim = (stripeSessionId: string): void => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, stripeSessionId)
  } catch {
    // ignore
  }
}

export const loadPostPaymentClaim = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const clearPostPaymentClaim = (): void => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
