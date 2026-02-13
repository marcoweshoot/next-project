/**
 * Facebook Pixel utilities
 * 
 * Provides helper functions for Facebook Pixel event tracking,
 * including event_id generation for deduplication.
 */

/**
 * Generate a unique event ID for Facebook Pixel events
 * Uses crypto.randomUUID() if available, fallback to custom UUID generation
 * 
 * @returns {string} A unique event ID (UUID v4 format)
 */
export function generateEventId(): string {
  // Check if crypto.randomUUID is available (modern browsers)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  
  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Create a consistent event ID from a Stripe session ID
 * Strips the 'cs_test_' or 'cs_live_' prefix if present
 * 
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {string} Formatted event ID
 */
export function createEventIdFromStripeSession(sessionId: string): string {
  if (!sessionId) {
    return generateEventId()
  }
  
  // Use the full Stripe session ID as event_id
  // It's already unique and suitable for Facebook Pixel
  return sessionId
}

/**
 * Create a purchase-specific event ID
 * Combines prefix with transaction identifier
 * 
 * @param {string} transactionId - Transaction identifier (e.g., booking ID, Stripe session)
 * @returns {string} Formatted event ID
 */
export function createPurchaseEventId(transactionId: string): string {
  if (!transactionId) {
    return `purchase_${generateEventId()}`
  }
  
  // If it's already a Stripe session ID, use it as-is
  if (transactionId.startsWith('cs_')) {
    return transactionId
  }
  
  return `purchase_${transactionId}`
}

/**
 * Validate event ID format
 * Facebook event_id should be alphanumeric with dashes/underscores, max 50 chars
 * 
 * @param {string} eventId - Event ID to validate
 * @returns {boolean} True if valid
 */
export function isValidEventId(eventId: string): boolean {
  if (!eventId || typeof eventId !== 'string') {
    return false
  }
  
  // Check length (max 50 characters recommended)
  if (eventId.length > 50) {
    return false
  }
  
  // Check format: alphanumeric, dashes, underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/
  return validPattern.test(eventId)
}

/**
 * Track Lead event (WhatsApp clicks, contact form submissions, etc.)
 * 
 * @param {Object} params - Lead event parameters
 * @param {string} params.contentName - Name of the content (tour title, "WhatsApp Contact", etc.)
 * @param {string} params.contentCategory - Category (default: "Viaggi Fotografici")
 * @param {number} params.value - Value in EUR (default: 0)
 */
export function trackLead({
  contentName,
  contentCategory = 'Viaggi Fotografici',
  value = 0,
}: {
  contentName: string
  contentCategory?: string
  value?: number
}) {
  if (typeof window === 'undefined' || !window.fbq) {
    return
  }

  const eventId = generateEventId()
  
  const eventData = {
    content_name: contentName,
    content_category: contentCategory,
    value,
    currency: 'EUR',
  }

  window.fbq('track', 'Lead', eventData, { eventID: eventId })
  
  // Log only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [FB PIXEL] Lead event tracked:', {
      contentName,
      eventId,
    })
  }
}

/**
 * Track AddToCart event (when user clicks "Prenota" or "Book" button)
 * 
 * @param {Object} params - AddToCart event parameters
 * @param {string} params.tourTitle - Tour title
 * @param {string} params.tourId - Tour ID
 * @param {string} params.sessionId - Session ID (optional)
 * @param {number} params.price - Price in EUR
 * @param {number} params.quantity - Quantity (default: 1)
 */
export function trackAddToCart({
  tourTitle,
  tourId,
  sessionId,
  price,
  quantity = 1,
}: {
  tourTitle: string
  tourId: string
  sessionId?: string
  price: number
  quantity?: number
}) {
  if (typeof window === 'undefined' || !window.fbq) {
    return
  }

  // Validate price
  if (!price || price <= 0 || !isFinite(price) || isNaN(price)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [FB PIXEL] AddToCart: Invalid price', price)
    }
    return
  }

  const eventId = generateEventId()
  
  const eventData = {
    content_name: tourTitle,
    content_ids: sessionId ? [sessionId] : [tourId],
    content_type: 'product',
    value: price,
    currency: 'EUR',
    num_items: quantity,
  }

  window.fbq('track', 'AddToCart', eventData, { eventID: eventId })
  
  // Log only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [FB PIXEL] AddToCart event tracked:', {
      tourTitle,
      price,
      quantity,
      eventId,
    })
  }
}

/**
 * Track ViewCategory event (destination pages, collection pages, calendar, etc.)
 * 
 * @param {Object} params - ViewCategory event parameters
 * @param {string} params.categoryName - Category name (e.g., "Italia", "Wildlife", "Marzo 2026")
 * @param {string} params.categoryType - Category type (e.g., "Destinazione", "Collezione", "Calendario", "Corso")
 * @param {string[]} params.contentIds - Array of content IDs in this category (optional)
 */
export function trackViewCategory({
  categoryName,
  categoryType,
  contentIds = [],
}: {
  categoryName: string
  categoryType: string
  contentIds?: string[]
}) {
  if (typeof window === 'undefined' || !window.fbq) {
    return
  }

  const eventId = generateEventId()
  
  const eventData: Record<string, any> = {
    content_name: categoryName,
    content_category: categoryType,
  }

  // Add content_ids only if available
  if (contentIds.length > 0) {
    eventData.content_ids = contentIds
  }

  window.fbq('track', 'ViewCategory', eventData, { eventID: eventId })
  
  // Log only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [FB PIXEL] ViewCategory event tracked:', {
      categoryName,
      categoryType,
      contentCount: contentIds.length,
      eventId,
    })
  }
}

