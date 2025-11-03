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

