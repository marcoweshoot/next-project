/**
 * Base URL for Stripe redirects, OAuth callbacks, and server-side links.
 *
 * Preview deployments MUST use VERCEL_URL so Stripe returns to the same branch,
 * not a hardcoded alias or production NEXT_PUBLIC_SITE_URL.
 */
export const getSiteUrl = (): string => {
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}
