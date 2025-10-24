/**
 * Gift Card Utilities
 * Handles gift card code generation, validation, and application
 */

import { createClient } from '@supabase/supabase-js'

export interface GiftCard {
  id: string
  code: string
  amount: number // in cents
  remaining_balance: number // in cents
  purchaser_user_id: string | null
  redeemed_by_user_id: string | null
  recipient_email: string | null
  status: 'active' | 'used' | 'expired' | 'cancelled'
  expires_at: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
}

export interface GiftCardTransaction {
  id: string
  gift_card_id: string
  booking_id: string | null
  user_id: string | null
  amount_used: number // in cents
  created_at: string
}

/**
 * Generate a unique gift card code
 * Format: XXXXXXXXXXXX (12 characters, no ambiguous chars)
 */
export function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No O, 0, I, 1, etc.
  let code = ''
  
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * Format gift card code for display
 */
export function formatGiftCardCode(code: string): string {
  // Remove any existing dashes
  const cleaned = code.replace(/-/g, '').toUpperCase()
  
  // Add dashes every 4 characters
  return cleaned.match(/.{1,4}/g)?.join('-') || cleaned
}

/**
 * Validate gift card code format
 */
export function isValidGiftCardCodeFormat(code: string): boolean {
  const cleaned = code.replace(/-/g, '').toUpperCase()
  return /^[A-Z0-9]{12}$/.test(cleaned)
}

/**
 * Validate and get gift card by code
 */
export async function validateGiftCardCode(
  code: string,
  supabase: ReturnType<typeof createClient>
): Promise<{ valid: boolean; giftCard?: GiftCard; error?: string }> {
  try {
    // Clean the code (remove dashes, uppercase) but don't format it
    const cleanedCode = code.replace(/-/g, '').toUpperCase()
    
    // Check format
    if (!isValidGiftCardCodeFormat(cleanedCode)) {
      return { valid: false, error: 'Formato codice non valido' }
    }
    
    // Query the gift card with the cleaned code (no dashes)
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', cleanedCode)
      .single()
    
    if (error || !giftCard) {
      return { valid: false, error: 'Codice gift card non trovato' }
    }
    
    // Check if expired
    if ((giftCard as any).expires_at && new Date((giftCard as any).expires_at) < new Date()) {
      return { valid: false, error: 'Gift card scaduta' }
    }
    
    // Check if used
    if ((giftCard as any).status === 'used' || (giftCard as any).remaining_balance <= 0) {
      return { valid: false, error: 'Gift card già utilizzata' }
    }
    
    // Check if cancelled
    if ((giftCard as any).status === 'cancelled') {
      return { valid: false, error: 'Gift card annullata' }
    }
    
    // Check if active
    if ((giftCard as any).status !== 'active') {
      return { valid: false, error: 'Gift card non attiva' }
    }
    
    return { valid: true, giftCard: giftCard as GiftCard }
  } catch (error) {
    console.error('Error validating gift card:', error)
    return { valid: false, error: 'Errore nella validazione del codice' }
  }
}

/**
 * Apply gift card to a payment
 * Returns the discount amount in cents
 */
export async function applyGiftCard(
  code: string,
  amountToPay: number, // in cents
  userId: string,
  bookingId: string | null,
  supabase: ReturnType<typeof createClient>
): Promise<{ success: boolean; discountAmount: number; remainingBalance: number; error?: string }> {
  try {
    // Validate the gift card
    const validation = await validateGiftCardCode(code, supabase)
    
    if (!validation.valid || !validation.giftCard) {
      return {
        success: false,
        discountAmount: 0,
        remainingBalance: 0,
        error: validation.error
      }
    }
    
    const giftCard = validation.giftCard
    
    // Calculate discount amount (can't be more than remaining balance or amount to pay)
    const discountAmount = Math.min(giftCard.remaining_balance, amountToPay)
    const newRemainingBalance = giftCard.remaining_balance - discountAmount
    
    // Update gift card balance
    const { error: updateError } = await (supabase as any)
      .from('gift_cards')
      .update({
        remaining_balance: newRemainingBalance,
        status: newRemainingBalance === 0 ? 'used' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', (giftCard as any).id)
    
    if (updateError) {
      console.error('Error updating gift card:', updateError)
      return {
        success: false,
        discountAmount: 0,
        remainingBalance: giftCard.remaining_balance,
        error: 'Errore nell\'applicazione della gift card'
      }
    }
    
    // Record transaction
    const { error: transactionError } = await (supabase as any)
      .from('gift_card_transactions')
      .insert({
        gift_card_id: (giftCard as any).id,
        booking_id: bookingId,
        user_id: userId,
        amount_used: discountAmount,
        created_at: new Date().toISOString()
      })
    
    if (transactionError) {
      console.error('Error recording gift card transaction:', transactionError)
      // Don't fail the whole operation if transaction recording fails
    }
    
    return {
      success: true,
      discountAmount,
      remainingBalance: newRemainingBalance
    }
  } catch (error) {
    console.error('Error applying gift card:', error)
    return {
      success: false,
      discountAmount: 0,
      remainingBalance: 0,
      error: 'Errore nell\'applicazione della gift card'
    }
  }
}

/**
 * Get all gift cards for a user
 */
export async function getUserGiftCards(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<GiftCard[]> {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .or(`purchaser_user_id.eq.${userId},redeemed_by_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user gift cards:', error)
      return []
    }
    
    return data as GiftCard[]
  } catch (error) {
    console.error('Error fetching user gift cards:', error)
    return []
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amountInCents / 100)
}

