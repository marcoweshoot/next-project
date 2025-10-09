import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for rate limiting
// In production, consider using Redis or similar
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
  skipSuccessfulRequests?: boolean
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = options

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'

    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`
    
    // Clean up expired entries
    for (const [k, v] of requests.entries()) {
      if (now > v.resetTime) {
        requests.delete(k)
      }
    }

    // Get or create request record
    let record = requests.get(key)
    
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    // Increment request count
    record.count++
    requests.set(key, record)

    // Check if limit exceeded
    if (record.count > maxRequests) {
      console.log(`🚨 Rate limit exceeded for IP: ${ip}, Path: ${request.nextUrl.pathname}`)
      
      return new NextResponse(
        JSON.stringify({
          error: message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
            'X-RateLimit-Reset': record.resetTime.toString()
          }
        }
      )
    }

    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
    response.headers.set('X-RateLimit-Reset', record.resetTime.toString())

    return null // Allow request to continue
  }
}

// Predefined rate limits
export const rateLimits = {
  // Webhook: 5 requests per minute
  webhook: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Webhook rate limit exceeded'
  }),

  // Login: 3 attempts per minute
  login: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    message: 'Too many login attempts, please try again later'
  }),

  // Registration: 2 registrations per hour
  registration: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 2,
    message: 'Too many registration attempts, please try again later'
  }),

  // General API: 100 requests per 15 minutes
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'API rate limit exceeded'
  })
}
