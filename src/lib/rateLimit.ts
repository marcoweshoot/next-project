import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for rate limiting
// In production, consider using Redis or similar
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
  keyPrefix?: string
  getKey?: (request: NextRequest) => string
}

const getClientIp = (request: NextRequest): string =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  'unknown'

const cleanupExpired = (now: number) => {
  for (const [k, v] of requests.entries()) {
    if (now > v.resetTime) {
      requests.delete(k)
    }
  }
}

const resolveKey = (request: NextRequest, options: Pick<RateLimitOptions, 'keyPrefix' | 'getKey'>): string => {
  if (options.getKey) {
    return options.getKey(request)
  }

  const ip = getClientIp(request)

  if (options.keyPrefix) {
    const match = request.nextUrl.pathname.match(/\/checkout\/claim\/(cs_[^/]+)/)
    if (match) {
      return `${ip}:${options.keyPrefix}:${match[1]}`
    }
  }

  return `${ip}:${request.nextUrl.pathname}`
}

const getRecord = (key: string, windowMs: number, now: number) => {
  cleanupExpired(now)

  let record = requests.get(key)
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + windowMs,
    }
    requests.set(key, record)
  }

  return record
}

const buildRateLimitResponse = (
  message: string,
  maxRequests: number,
  record: { count: number; resetTime: number },
  now: number
): NextResponse => {
  const retryAfter = Math.ceil((record.resetTime - now) / 1000)

  return new NextResponse(
    JSON.stringify({
      error: message,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
        'X-RateLimit-Reset': record.resetTime.toString(),
      },
    }
  )
}

export const checkRateLimit = async (
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
  } = options

  const now = Date.now()
  const key = resolveKey(request, options)
  const record = getRecord(key, windowMs, now)

  if (record.count >= maxRequests) {
    console.log(`🚨 Rate limit exceeded for key: ${key}`)
    return buildRateLimitResponse(message, maxRequests, record, now)
  }

  return null
}

export const recordRateLimitFailure = (
  request: NextRequest,
  options: RateLimitOptions
): void => {
  const { windowMs } = options
  const now = Date.now()
  const key = resolveKey(request, options)
  const record = getRecord(key, windowMs, now)

  record.count++
  requests.set(key, record)
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
  } = options

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const now = Date.now()
    const key = resolveKey(request, options)
    const record = getRecord(key, windowMs, now)

    record.count++
    requests.set(key, record)

    if (record.count > maxRequests) {
      console.log(`🚨 Rate limit exceeded for key: ${key}`)
      return buildRateLimitResponse(message, maxRequests, record, now)
    }

    return null
  }
}

const checkoutClaimRegistrationOptions: RateLimitOptions = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: 'Troppi tentativi di registrazione, riprova più tardi',
  keyPrefix: 'checkout-claim',
}

export const checkoutClaimRegistration = {
  check: (request: NextRequest) => checkRateLimit(request, checkoutClaimRegistrationOptions),
  recordFailure: (request: NextRequest) => recordRateLimitFailure(request, checkoutClaimRegistrationOptions),
}

// Predefined rate limits
export const rateLimits = {
  webhook: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Webhook rate limit exceeded',
  }),

  login: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 3,
    message: 'Too many login attempts, please try again later',
  }),

  registration: rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 2,
    message: 'Too many registration attempts, please try again later',
  }),

  api: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'API rate limit exceeded',
  }),
}
