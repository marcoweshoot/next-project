import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { rateLimits } from '@/lib/rateLimit'
import { validateFields } from '@/lib/validation'
import { sendAdminNotification, generateNewBookingAdminEmail } from '@/lib/email'
import Stripe from 'stripe'

// Stripe consiglia Node.js runtime per i webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimits.webhook(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  const timestamp = new Date().toISOString()
  
  try {
    // Leggi il body come stringa raw
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ 
        error: 'No signature',
        timestamp,
        bodyLength: body.length 
      }, { status: 400 })
    }

    // Verifica la firma
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // Processa l'evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Usa Service Role Key per bypassare RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // 🎁 GIFT CARD: Controllo PRIMA della validazione tour
      if (session.metadata?.type === 'gift_card') {
        console.log('🎁 [WEBHOOK] Processing gift card purchase...')
        
        try {
          // Import gift card utilities
          const { generateGiftCardCode } = await import('@/lib/giftCards')
          
          // Generate unique code
          let giftCardCode = generateGiftCardCode()
          let isUnique = false
          let attempts = 0
          
          // Ensure code is unique (max 5 attempts)
          while (!isUnique && attempts < 5) {
            const { data: existing } = await supabase
              .from('gift_cards')
              .select('id')
              .eq('code', giftCardCode)
              .single()
            
            if (!existing) {
              isUnique = true
            } else {
              giftCardCode = generateGiftCardCode()
              attempts++
            }
          }
          
          if (!isUnique) {
            console.error('❌ [WEBHOOK] Failed to generate unique gift card code')
            return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
          }
          
          const giftCardAmount = parseInt(session.metadata?.amount || '0')
          const purchaserUserId = session.metadata?.userId || null
          const recipientEmail = session.customer_details?.email || null
          
          // Set expiration to 2 years from now
          const expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 2)
          
          // Create gift card
          const { data: giftCard, error: insertError } = await supabase
            .from('gift_cards')
            .insert({
              code: giftCardCode,
              amount: giftCardAmount * 100, // Convert to cents
              remaining_balance: giftCardAmount * 100,
              purchaser_user_id: purchaserUserId,
              recipient_email: recipientEmail,
              status: 'active',
              expires_at: expiresAt.toISOString(),
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .select()
            .single()
          
          if (insertError) {
            console.error('❌ [WEBHOOK] Failed to create gift card:', insertError)
            return NextResponse.json({ 
              error: 'Gift card creation failed',
              details: insertError.message 
            }, { status: 500 })
          }
          
          console.log(`✅ [WEBHOOK] Gift card created successfully: ${giftCardCode}`)
          
          // Send email with gift card code (non-blocking)
          if (recipientEmail) {
            try {
              console.log(`📧 [WEBHOOK] Sending gift card email to: ${recipientEmail}`)
              const { sendGiftCardEmail } = await import('@/lib/email')
              
              const emailSent = await sendGiftCardEmail(
                recipientEmail,
                giftCardCode,
                giftCardAmount * 100,
                expiresAt.toISOString()
              )
              
              if (emailSent) {
                console.log('✅ [WEBHOOK] Gift card email sent successfully!')
              } else {
                console.error('❌ [WEBHOOK] Gift card email failed to send')
              }
            } catch (emailError) {
              console.error('❌ [WEBHOOK] Exception sending gift card email:', emailError)
              // Don't fail the gift card creation
            }
          }
          
          return NextResponse.json({
            success: true,
            message: 'Gift card processed successfully',
            giftCardCode
          })
          
        } catch (error) {
          console.error('❌ [WEBHOOK] Exception during gift card creation:', error)
          return NextResponse.json({ 
            error: 'Gift card creation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }

      // 🏛️ TOUR: Validazione normale (solo se NON è gift card)
      // Estrai i custom_fields da Stripe
      const customFields = session.custom_fields || []
      const fiscalCodeField = customFields.find((f: any) => f.key === 'fiscal_code')
      const vatNumberField = customFields.find((f: any) => f.key === 'vat_number')
      const phoneNumberField = customFields.find((f: any) => f.key === 'phone_number')

      const fiscalCode = fiscalCodeField?.text?.value || null
      const vatNumber = vatNumberField?.text?.value || null
      const phoneNumber = phoneNumberField?.text?.value || null

      // Estrai anche l'indirizzo di fatturazione da Stripe
      const billingAddress = session.customer_details?.address
      const fullAddress = billingAddress ? 
        `${billingAddress.line1 || ''} ${billingAddress.line2 || ''}, ${billingAddress.city || ''}, ${billingAddress.postal_code || ''}, ${billingAddress.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') 
        : null

      const rawData = {
        userId: session.metadata?.userId,
        tourId: session.metadata?.tourId,
        sessionId: session.metadata?.sessionId,
        paymentType: session.metadata?.paymentType,
        quantity: session.metadata?.quantity
      }

      // Validate and sanitize input data
      const validation = validateFields(rawData)
      if (!validation.isValid) {
        return NextResponse.json({ 
          error: 'Invalid input data',
          details: validation.errors,
          timestamp
        }, { status: 400 })
      }

      const { sanitizedData } = validation
      const userId = sanitizedData.userId
      const tourId = sanitizedData.tourId
      const sessionId = sanitizedData.sessionId
      const paymentType = sanitizedData.paymentType
      const quantity = sanitizedData.quantity

      if (!userId || !tourId || !sessionId || !paymentType) {
        return NextResponse.json({ 
          error: 'Missing required metadata',
          timestamp,
          sessionId: session.id,
          availableMetadata: session.metadata 
        }, { status: 400 })
      }

      // Ora tutti gli utenti dovrebbero essere registrati prima del pagamento
      const finalUserId = userId

      if (userId === 'anonymous') {
        return NextResponse.json({ 
          error: 'Anonymous users not supported - user must register first',
          timestamp,
          sessionId: session.id 
        }, { status: 400 })
      }

      // Gestisci acconto vs saldo
      if (paymentType === 'deposit') {
        // Crea nuovo booking per acconto
        try {
          // Calcola il totale atteso (prezzo completo per tutte le persone)
          const sessionPrice = parseFloat(session.metadata?.sessionPrice || '0')
          const quantityValue = parseInt(session.metadata?.quantity || '1')
          const expectedTotal = sessionPrice * 100 * quantityValue
          
          // Check if gift card was applied
          const giftCardCode = session.metadata?.giftCardCode
          const giftCardDiscount = parseInt(session.metadata?.giftCardDiscount || '0')
          const originalAmount = parseInt(session.metadata?.originalAmount || session.amount_total.toString())
          
          // Calculate total amount paid (Stripe payment + gift card discount)
          const totalAmountPaid = session.amount_total + giftCardDiscount
          
          // Determina lo status: se l'importo pagato >= totale atteso, è tutto pagato
          const bookingStatus = totalAmountPaid >= expectedTotal ? 'fully_paid' : 'deposit_paid'

          const { data: newBooking, error: insertError } = await supabase
            .from('bookings')
            .insert({
              user_id: finalUserId,
              tour_id: tourId,
              session_id: sessionId,
              status: bookingStatus,
              deposit_amount: session.amount_total,
              total_amount: expectedTotal,
              amount_paid: totalAmountPaid, // Include gift card discount
              stripe_payment_intent_id: session.payment_intent as string,
              deposit_due_date: new Date().toISOString(),
              balance_due_date: session.metadata?.sessionDate ? 
                new Date(new Date(session.metadata.sessionDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni prima della partenza
              quantity: quantity,
              tour_title: session.metadata?.tourTitle || '',
              tour_destination: session.metadata?.tourDestination || '',
              session_date: session.metadata?.sessionDate || '',
              session_end_date: session.metadata?.sessionEndDate || '',
            })
            .select()
            .single()

          if (insertError) {
            return NextResponse.json({ 
              error: 'Booking creation failed',
              details: insertError.message 
            }, { status: 500 })
          }
          
          // Apply gift card if present
          if (giftCardCode && giftCardDiscount > 0 && newBooking) {
            try {
              console.log(`🎁 [WEBHOOK] Applying gift card ${giftCardCode} with discount ${giftCardDiscount}`)
              const { applyGiftCard } = await import('@/lib/giftCards')
              
              const result = await applyGiftCard(
                giftCardCode,
                originalAmount,
                finalUserId,
                newBooking.id,
                supabase as any
              )
              
              if (result.success) {
                console.log(`✅ [WEBHOOK] Gift card applied successfully. Remaining balance: ${result.remainingBalance}`)
              } else {
                console.error(`❌ [WEBHOOK] Failed to apply gift card: ${result.error}`)
                // Don't fail the booking, just log the error
              }
            } catch (giftCardError) {
              console.error('❌ [WEBHOOK] Exception applying gift card:', giftCardError)
              // Don't fail the booking
            }
          }

          // Invia notifica email all'admin (non-blocking)
          try {
            console.log('📧 [WEBHOOK] Attempting to send admin notification...')
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', finalUserId)
              .single()

            if (userProfile) {
              const userName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Cliente'
              const userEmail = userProfile.email || ''
              
              console.log(`📧 [WEBHOOK] User profile found: ${userName} (${userEmail})`)
              
              const emailContent = generateNewBookingAdminEmail(
                userName,
                userEmail,
                session.metadata?.tourTitle || 'Tour',
                '', // bookingId - we don't have it yet from the insert
                session.amount_total || 0,
                quantityValue,
                'deposit'
              )

              console.log(`📧 [WEBHOOK] Email content generated. Subject: ${emailContent.subject}`)
              console.log(`📧 [WEBHOOK] Sending to admin email: ${process.env.ADMIN_EMAIL}`)

              // Send admin notification (non-blocking)
              const emailSent = await sendAdminNotification(emailContent.subject, emailContent.html, emailContent.text)
              
              if (emailSent) {
                console.log('✅ [WEBHOOK] Admin notification sent successfully!')
              } else {
                console.error('❌ [WEBHOOK] Admin notification failed to send')
              }
            } else {
              console.warn('⚠️ [WEBHOOK] User profile not found for userId:', finalUserId)
            }
          } catch (emailError) {
            // Log but don't fail the booking
            console.error('❌ [WEBHOOK] Error sending admin notification:', emailError)
          }

          // Aggiorna il profilo utente con i dati fiscali da Stripe (se presenti)
          if (fiscalCode || vatNumber || phoneNumber || fullAddress) {
            const updateData: any = {}
            
            if (fiscalCode) {
              updateData.fiscal_code = fiscalCode.toUpperCase()
            }
            if (vatNumber) {
              updateData.vat_number = vatNumber.toUpperCase()
            }
            if (phoneNumber) {
              // Salva come mobile_phone se non c'è già
              updateData.mobile_phone = phoneNumber
            }
            if (fullAddress) {
              updateData.address = fullAddress
              // Estrai anche i singoli campi se disponibili
              if (billingAddress?.city) updateData.city = billingAddress.city
              if (billingAddress?.postal_code) updateData.postal_code = billingAddress.postal_code
              if (billingAddress?.country) updateData.country = billingAddress.country
            }

            const { error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', finalUserId)

            // Non blocchiamo il flusso se l'aggiornamento del profilo fallisce
            if (updateError) {
              console.error('Error updating user profile:', updateError)
            }
          }

          // Purchase tracking (implementare se necessario)
        } catch (error) {
          console.error('Exception during booking creation:', error)
          return NextResponse.json({ 
            error: 'Booking creation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      } else if (paymentType === 'balance') {
        // Aggiorna booking esistente per saldo
        try {
          // Cerca la prenotazione esistente
          const { data: existingBookings, error: searchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', finalUserId)
            .eq('tour_id', tourId)
            .eq('session_id', sessionId)
            .eq('status', 'deposit_paid')
            .order('created_at', { ascending: false })
            .limit(1)

          if (searchError) {
            return NextResponse.json({ error: 'Failed to find existing booking' }, { status: 500 })
          }

          if (!existingBookings || existingBookings.length === 0) {
            return NextResponse.json({ error: 'No existing booking found for balance payment' }, { status: 400 })
          }

          const existingBooking = existingBookings[0]

          // Check if gift card was applied
          const giftCardCode = session.metadata?.giftCardCode
          const giftCardDiscount = parseInt(session.metadata?.giftCardDiscount || '0')
          const originalAmount = parseInt(session.metadata?.originalAmount || session.amount_total.toString())

          // Aggiorna lo status a fully_paid e l'importo pagato (include gift card)
          const newAmountPaid = (existingBooking.amount_paid || 0) + session.amount_total + giftCardDiscount
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'fully_paid',
              amount_paid: newAmountPaid, // Include gift card discount
              stripe_payment_intent_id: session.payment_intent as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingBooking.id)

          if (updateError) {
            return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
          }
          
          // Apply gift card if present
          if (giftCardCode && giftCardDiscount > 0) {
            try {
              console.log(`🎁 [WEBHOOK] Applying gift card ${giftCardCode} for balance payment`)
              const { applyGiftCard } = await import('@/lib/giftCards')
              
              const result = await applyGiftCard(
                giftCardCode,
                originalAmount,
                finalUserId,
                existingBooking.id,
                supabase as any
              )
              
              if (result.success) {
                console.log(`✅ [WEBHOOK] Gift card applied successfully. Remaining balance: ${result.remainingBalance}`)
              } else {
                console.error(`❌ [WEBHOOK] Failed to apply gift card: ${result.error}`)
              }
            } catch (giftCardError) {
              console.error('❌ [WEBHOOK] Exception applying gift card:', giftCardError)
            }
          }

          // Invia notifica email all'admin per saldo completato (non-blocking)
          try {
            console.log('📧 [WEBHOOK] Attempting to send admin notification for balance payment...')
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', finalUserId)
              .single()

            if (userProfile) {
              const userName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Cliente'
              const userEmail = userProfile.email || ''
              
              console.log(`📧 [WEBHOOK] User profile found: ${userName} (${userEmail})`)
              
              const emailContent = generateNewBookingAdminEmail(
                userName,
                userEmail,
                existingBooking.tour_title || session.metadata?.tourTitle || 'Tour',
                existingBooking.id,
                session.amount_total || 0,
                existingBooking.quantity || 1,
                'balance'
              )

              console.log(`📧 [WEBHOOK] Email content generated. Subject: ${emailContent.subject}`)
              console.log(`📧 [WEBHOOK] Sending to admin email: ${process.env.ADMIN_EMAIL}`)

              // Send admin notification (non-blocking)
              const emailSent = await sendAdminNotification(emailContent.subject, emailContent.html, emailContent.text)
              
              if (emailSent) {
                console.log('✅ [WEBHOOK] Admin notification sent successfully!')
              } else {
                console.error('❌ [WEBHOOK] Admin notification failed to send')
              }
            } else {
              console.warn('⚠️ [WEBHOOK] User profile not found for userId:', finalUserId)
            }
          } catch (emailError) {
            // Log but don't fail the booking
            console.error('❌ [WEBHOOK] Error sending admin notification:', emailError)
          }

          // Aggiorna il profilo utente con i dati fiscali da Stripe (se presenti)
          if (fiscalCode || vatNumber || phoneNumber || fullAddress) {
            const updateData: any = {}
            
            if (fiscalCode) {
              updateData.fiscal_code = fiscalCode.toUpperCase()
            }
            if (vatNumber) {
              updateData.vat_number = vatNumber.toUpperCase()
            }
            if (phoneNumber) {
              updateData.mobile_phone = phoneNumber
            }
            if (fullAddress) {
              updateData.address = fullAddress
              // Estrai anche i singoli campi se disponibili
              if (billingAddress?.city) updateData.city = billingAddress.city
              if (billingAddress?.postal_code) updateData.postal_code = billingAddress.postal_code
              if (billingAddress?.country) updateData.country = billingAddress.country
            }

            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', finalUserId)

            if (profileUpdateError) {
              console.error('Error updating user profile:', profileUpdateError)
            }
          }
        } catch (error) {
          return NextResponse.json({ error: 'Balance payment failed' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Unknown payment type' }, { status: 400 })
      }

      // Aggiorna il profilo con i dati di fatturazione da Stripe
      if (session.customer_details) {
        try {
          const customerDetails = session.customer_details
          const billingAddress = customerDetails.address
          
          const profileUpdate: Record<string, string> = {}
          
          // Aggiungi email se presente
          if (customerDetails.email) {
            profileUpdate.email = customerDetails.email
          }
          
          // Aggiungi indirizzo se presente
          if (billingAddress?.line1) {
            profileUpdate.address = billingAddress.line1
          }
          if (billingAddress?.city) {
            profileUpdate.city = billingAddress.city
          }
          if (billingAddress?.postal_code) {
            profileUpdate.postal_code = billingAddress.postal_code
          }
          if (billingAddress?.country) {
            profileUpdate.country = billingAddress.country
          }
          
          // Aggiungi dati fiscali da custom fields di Stripe
          if (session.custom_fields) {
            session.custom_fields.forEach((field: { key: string; text?: { value: string } }) => {
              if (field.key === 'fiscal_code' && field.text?.value) {
                const fiscalCode = field.text.value.trim().toUpperCase()
                
                // Valida formato codice fiscale italiano (16 caratteri, solo lettere e numeri)
                if (fiscalCode && fiscalCode.length === 16 && /^[A-Z0-9]{16}$/.test(fiscalCode)) {
                  profileUpdate.fiscal_code = fiscalCode
                }
              }
                if (field.key === 'vat_number' && field.text?.value && field.text.value.trim()) {
                  profileUpdate.vat_number = field.text.value.trim()
                }
                if (field.key === 'phone_number' && field.text?.value && field.text.value.trim()) {
                  profileUpdate.phone_number = field.text.value.trim()
                }
            })
          }
          
          // Aggiorna il profilo solo se ci sono dati da aggiornare
          if (Object.keys(profileUpdate).length > 0) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: finalUserId,
                ...profileUpdate,
              }, { onConflict: 'id' })
            
            if (profileError) {
              // Non bloccare il flusso se l'aggiornamento del profilo fallisce
            }
          }
        } catch {
          // Non bloccare il flusso se l'aggiornamento del profilo fallisce
        }
      }
    } else if (event.type === 'payment_intent.succeeded') {
      // Payment Intent events are handled automatically by Stripe when using Checkout Sessions
      // We only need to handle checkout.session.completed events for our booking system
    }

    return NextResponse.json({ 
      received: true, 
      timestamp,
      eventType: event.type,
      processed: true 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      timestamp,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
