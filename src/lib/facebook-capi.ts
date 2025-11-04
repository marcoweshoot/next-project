/**
 * Facebook Conversions API (CAPI) Helper
 * 
 * This module provides functions to send server-side events to the Facebook Conversions API.
 * It handles payload construction, hashing of user data, and secure communication with the Facebook Graph API.
 * It is designed to be used from server-side environments (e.g., API routes, webhooks).
 * 
 * Main functions:
 * - sendServerEvent: Sends a single event to the CAPI.
 * 
 * For more details on CAPI, see the official documentation:
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto'

export interface UserData {
  em?: string // Email
  ph?: string // Phone
  fn?: string // First name
  ln?: string // Last name
  ge?: string // Gender
  db?: string // Date of birth
  ct?: string // City
  st?: string // State
  zp?: string // Zip code
  country?: string // Country
  external_id?: string // External ID (e.g., user_id)
  client_ip_address?: string
  client_user_agent?: string
  fbc?: string // Facebook click ID
  fbp?: string // Facebook browser ID
}

interface CustomData {
  value?: number
  currency?: string
  content_name?: string
  content_category?: string
  content_ids?: string[]
  contents?: { id: string; quantity: number }[]
  num_items?: number
  order_id?: string
}

interface ServerEvent {
  event_name: string
  event_time: number
  user_data: UserData
  custom_data: CustomData
  event_source_url: string
  action_source: 'website'
  event_id?: string
}

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL
const FB_CAPI_ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN
const FB_TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE

/**
 * Hashes a string using SHA-256.
 * @param {string} value - The string to hash.
 * @returns {string} The SHA-256 hashed string.
 */
function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * Normalizes and hashes user data for the Conversions API.
 * Fields like email, name, etc., are trimmed, lowercased, and then hashed.
 * @param {UserData} userData - The user data to process.
 * @returns {UserData} The processed user data with hashed values.
 */
function normalizeAndHashUserData(userData: UserData): UserData {
  const normalized: UserData = {}
  
  for (const key in userData) {
    const value = userData[key as keyof UserData]
    if (value) {
      const trimmedValue = value.trim()
      
      switch (key) {
        case 'em':
        case 'fn':
        case 'ln':
        case 'ge':
        case 'ct':
        case 'st':
        case 'country':
          normalized[key as keyof UserData] = hash(trimmedValue.toLowerCase())
          break
        case 'ph':
          normalized.ph = hash(trimmedValue.replace(/\D/g, ''))
          break
        case 'zp':
          normalized.zp = hash(trimmedValue.toLowerCase().replace(/\s/g, ''))
          break
        case 'db':
          normalized.db = hash(trimmedValue.replace(/\D/g, ''))
          break
        default:
          normalized[key as keyof UserData] = value // Keep fields like fbc, fbp, ip_address as is
      }
    }
  }
  
  return normalized
}


/**
 * Sends a server-side event to the Facebook Conversions API.
 * This function is asynchronous and should be awaited. It will not throw errors
 * to prevent it from blocking critical user flows like payments.
 * 
 * @param {ServerEvent} event - The event object to send.
 * @returns {Promise<boolean>} A promise that resolves to true if the event was sent successfully, false otherwise.
 */
export async function sendServerEvent(event: Omit<ServerEvent, 'action_source' | 'event_time'>): Promise<boolean> {
  if (!FB_PIXEL_ID || !FB_CAPI_ACCESS_TOKEN) {
    console.warn('⚠️ [FB CAPI] Missing required environment variables (FB_PIXEL_ID or FB_CAPI_ACCESS_TOKEN). Event not sent.')
    return false
  }

  const url = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events`

  const payload = {
    data: [
      {
        ...event,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website' as const,
        user_data: event.user_data, // User data should be pre-normalized
      },
    ],
    ...(FB_TEST_EVENT_CODE && { test_event_code: FB_TEST_EVENT_CODE }),
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FB_CAPI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('❌ [FB CAPI] Error sending event to Facebook:', responseData)
      return false
    }

    if (FB_TEST_EVENT_CODE) {
      console.log('✅ [FB CAPI] Test event sent successfully to Facebook:', {
        eventName: event.event_name,
        eventId: event.event_id,
        traceId: responseData.trace_id,
      })
    } else {
      console.log('✅ [FB CAPI] Event sent successfully to Facebook:', {
        eventName: event.event_name,
        eventId: event.event_id,
      })
    }

    return true
  } catch (error) {
    console.error('❌ [FB CAPI] Failed to send event due to a network or unexpected error:', error)
    return false
  }
}
