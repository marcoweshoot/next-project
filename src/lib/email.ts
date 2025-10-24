// Email service for sending notifications using Brevo (ex Sendinblue)
import * as brevo from '@getbrevo/brevo'

export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

const DEFAULT_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@weshoot.it'
const DEFAULT_FROM_NAME = process.env.BREVO_FROM_NAME || 'WeShoot'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@weshoot.it'

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    console.log(`📧 [EMAIL] Attempting to send email to: ${emailData.to}`)
    console.log(`📧 [EMAIL] Subject: ${emailData.subject}`)
    
    // In development, just log the email
    if (process.env.NODE_ENV === 'development' && !process.env.BREVO_API_KEY) {
      console.log('📧 [EMAIL] Development mode - Email would be sent:')
      console.log('From:', emailData.from || DEFAULT_FROM_EMAIL)
      console.log('To:', emailData.to)
      console.log('Subject:', emailData.subject)
      console.log('HTML:', emailData.html.substring(0, 200) + '...')
      return true
    }

    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ [EMAIL] BREVO_API_KEY not configured. Email not sent.')
      return false
    }

    console.log('📧 [EMAIL] Brevo API key found, initializing...')

    // Initialize Brevo API
    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    )

    // Prepare recipients
    const recipients = Array.isArray(emailData.to)
      ? emailData.to.map(email => ({ email }))
      : [{ email: emailData.to }]

    console.log(`📧 [EMAIL] Sending to ${recipients.length} recipient(s)`)

    // Send email via Brevo
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.sender = { 
      email: emailData.from || DEFAULT_FROM_EMAIL, 
      name: DEFAULT_FROM_NAME 
    }
    sendSmtpEmail.to = recipients
    sendSmtpEmail.subject = emailData.subject
    sendSmtpEmail.htmlContent = emailData.html
    if (emailData.text) {
      sendSmtpEmail.textContent = emailData.text
    }
    if (emailData.replyTo) {
      sendSmtpEmail.replyTo = { email: emailData.replyTo }
    }

    console.log('📧 [EMAIL] Calling Brevo API...')
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    console.log(`✅ [EMAIL] Email sent successfully! Status: ${result.response.statusCode}`)
    console.log(`✅ [EMAIL] Message ID: ${result.body.messageId}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL] Error sending email:', error)
    if (error instanceof Error) {
      console.error('❌ [EMAIL] Error message:', error.message)
      console.error('❌ [EMAIL] Error stack:', error.stack)
    }
    // Log the full error object for debugging
    console.error('❌ [EMAIL] Full error:', JSON.stringify(error, null, 2))
    return false
  }
}

export async function sendAdminNotification(
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Admin] ${subject}`,
    html,
    text,
  })
}

/**
 * Send gift card email to recipient
 */
export async function sendGiftCardEmail(
  recipientEmail: string,
  giftCardCode: string,
  amount: number, // in cents
  expiresAt: string
): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount / 100)
  
  const expirationDate = new Date(expiresAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  const subject = `🎁 La tua Gift Card WeShoot di ${formattedAmount}`
  
  const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift Card WeShoot</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    }
    .print-only { display: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header with WeShoot colors -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎁 Gift Card WeShoot</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">Il regalo perfetto per chi ama la fotografia</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Congratulazioni!</h2>
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Hai ricevuto una Gift Card WeShoot del valore di <strong style="color: #dc2626;">${formattedAmount}</strong>!
              </p>
              
              <!-- Gift Card Box -->
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Il tuo codice</p>
                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 10px 0;">
                  <code style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 2px; font-family: 'Courier New', monospace;">${giftCardCode}</code>
                </div>
                <p style="margin: 10px 0 0; color: #ffffff; font-size: 28px; font-weight: bold;">${formattedAmount}</p>
              </div>
              
              <!-- How to use -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Come utilizzarla</h3>
                <ol style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                  <li>Scegli il tuo viaggio fotografico su <a href="https://www.weshoot.it/viaggi-fotografici" style="color: #dc2626; text-decoration: none;">weshoot.it</a></li>
                  <li>Durante il pagamento, inserisci il codice della gift card</li>
                  <li>Lo sconto verrà applicato automaticamente</li>
                  <li>Completa la prenotazione e preparati a partire!</li>
                </ol>
              </div>
              
              <!-- Important info -->
              <div style="margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  <strong>Validità:</strong> Questa gift card è valida fino al <strong>${expirationDate}</strong>
                </p>
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  <strong>Valore rimanente:</strong> Puoi usare la gift card su più prenotazioni fino ad esaurimento del credito
                </p>
              </div>
              
              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://www.weshoot.it/viaggi-fotografici" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0;">Scopri i Viaggi</a>
                <a href="https://www.weshoot.it/auth/register?gift_card=${giftCardCode}" style="display: inline-block; background: transparent; color: #dc2626; text-decoration: none; padding: 16px 40px; border: 2px solid #dc2626; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0;">Crea Account per Gestire</a>
              </div>
              
              <!-- Print Instructions -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">🖨️ Per Stampare questa Email</h3>
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  <strong>Opzione 1:</strong> Usa Ctrl+P (Windows) o Cmd+P (Mac) per stampare direttamente
                </p>
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  <strong>Opzione 2:</strong> Salva questa email come PDF e stampala quando necessario
                </p>
              </div>

              <!-- Account Benefits -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #28a745;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">💡 Perché creare un account?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                  <li><strong>Gestisci le tue gift card</strong> - Vedi saldo e storico utilizzi</li>
                  <li><strong>Tracking automatico</strong> - Ricevi notifiche quando vengono usate</li>
                  <li><strong>Supporto prioritario</strong> - Assistenza dedicata per i tuoi acquisti</li>
                  <li><strong>Offerte esclusive</strong> - Sconti speciali per i nostri clienti</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                Hai domande? Contattaci a <a href="mailto:info@weshoot.it" style="color: #667eea; text-decoration: none;">info@weshoot.it</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} WeShoot. Tutti i diritti riservati.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  const text = `
🎁 Gift Card WeShoot

Congratulazioni! Hai ricevuto una Gift Card WeShoot del valore di ${formattedAmount}!

IL TUO CODICE: ${giftCardCode}

Come utilizzarla:
1. Scegli il tuo viaggio fotografico su weshoot.it/viaggi-fotografici
2. Durante il pagamento, inserisci il codice della gift card
3. Lo sconto verrà applicato automaticamente
4. Completa la prenotazione e preparati a partire!

Validità: Fino al ${expirationDate}

Puoi usare la gift card su più prenotazioni fino ad esaurimento del credito.

💡 BONUS: Crea un account per gestire le tue gift card
- Gestisci le tue gift card e vedi saldo
- Tracking automatico degli utilizzi
- Supporto prioritario
- Offerte esclusive

Registrati qui: https://www.weshoot.it/auth/register?gift_card=${giftCardCode}

Hai domande? Contattaci a info@weshoot.it

© ${new Date().getFullYear()} WeShoot. Tutti i diritti riservati.
  `.trim()
  
  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  })
}

// Admin notification templates
export function generateNewBookingAdminEmail(
  userName: string,
  userEmail: string,
  tourTitle: string,
  bookingId: string,
  amount: number,
  quantity: number,
  paymentType: 'deposit' | 'balance'
): { subject: string; html: string; text: string } {
  const formattedAmount = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)

  const subject = paymentType === 'deposit' 
    ? `Nuova Prenotazione: ${tourTitle}` 
    : `Saldo Completato: ${tourTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e9ecef; }
        th { background: #f8f9fa; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ${paymentType === 'deposit' ? 'Nuova Prenotazione!' : 'Saldo Completato!'}</h1>
        </div>
        
        <div class="content">
          <p><strong>${paymentType === 'deposit' ? 'È stata ricevuta una nuova prenotazione!' : 'Un cliente ha completato il pagamento del saldo!'}</strong></p>
          
          <div class="info-box">
            <h3>📋 Dettagli Prenotazione</h3>
            <table>
              <tr>
                <th>Tour</th>
                <td>${tourTitle}</td>
              </tr>
              <tr>
                <th>Cliente</th>
                <td>${userName}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td><a href="mailto:${userEmail}">${userEmail}</a></td>
              </tr>
              <tr>
                <th>ID Prenotazione</th>
                <td>${bookingId}</td>
              </tr>
              <tr>
                <th>Partecipanti</th>
                <td>${quantity}</td>
              </tr>
              <tr>
                <th>Importo ${paymentType === 'deposit' ? 'Acconto' : 'Saldo'}</th>
                <td><strong>${formattedAmount}</strong></td>
              </tr>
              <tr>
                <th>Tipo Pagamento</th>
                <td>${paymentType === 'deposit' ? '💳 Acconto' : '✅ Saldo Completo'}</td>
              </tr>
              <tr>
                <th>Data</th>
                <td>${new Date().toLocaleString('it-IT')}</td>
              </tr>
            </table>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings" class="button">
            Vai alla Dashboard Admin
          </a>
        </div>
        
        <div class="footer">
          <p>Questa è una notifica automatica del sistema di prenotazioni WeShoot.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `${subject}\n\n${paymentType === 'deposit' ? 'Nuova prenotazione ricevuta!' : 'Saldo completato!'}\n\nDettagli:\n- Tour: ${tourTitle}\n- Cliente: ${userName} (${userEmail})\n- ID: ${bookingId}\n- Partecipanti: ${quantity}\n- Importo: ${formattedAmount}\n- Data: ${new Date().toLocaleString('it-IT')}\n\nVai alla dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings`

  return { subject, html, text }
}

export function generateDepositReminderAdminEmail(
  userName: string,
  userEmail: string,
  tourTitle: string,
  bookingId: string,
  daysUntilDue: number
): { subject: string; html: string; text: string } {
  const subject = `Acconto in Scadenza: ${tourTitle} - ${userName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #333; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Acconto in Scadenza</h1>
        </div>
        
        <div class="content">
          <div class="warning-box">
            <p><strong>⚠️ Attenzione:</strong> Un cliente ha un acconto in scadenza tra ${daysUntilDue} giorni.</p>
          </div>
          
          <h3>Dettagli Cliente</h3>
          <ul>
            <li><strong>Nome:</strong> ${userName}</li>
            <li><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></li>
            <li><strong>Tour:</strong> ${tourTitle}</li>
            <li><strong>ID Prenotazione:</strong> ${bookingId}</li>
          </ul>
          
          <p>Considera di contattare il cliente per ricordargli il pagamento imminente.</p>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings" class="button">
            Gestisci Prenotazione
          </a>
        </div>
        
        <div class="footer">
          <p>Questa è una notifica automatica del sistema di prenotazioni WeShoot.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `${subject}\n\nUn cliente ha un acconto in scadenza tra ${daysUntilDue} giorni.\n\nCliente: ${userName} (${userEmail})\nTour: ${tourTitle}\nID: ${bookingId}\n\nGestisci: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings`

  return { subject, html, text }
}

export function generateBalanceReminderAdminEmail(
  userName: string,
  userEmail: string,
  tourTitle: string,
  bookingId: string,
  amount: number,
  daysUntilDue: number
): { subject: string; html: string; text: string } {
  const formattedAmount = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)

  const subject = `Saldo in Scadenza: ${tourTitle} - ${userName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .alert-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Saldo in Scadenza</h1>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <p><strong>⚠️ Urgente:</strong> Un cliente ha il saldo in scadenza tra ${daysUntilDue} giorni.</p>
          </div>
          
          <h3>Dettagli Cliente</h3>
          <ul>
            <li><strong>Nome:</strong> ${userName}</li>
            <li><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></li>
            <li><strong>Tour:</strong> ${tourTitle}</li>
            <li><strong>ID Prenotazione:</strong> ${bookingId}</li>
            <li><strong>Importo Saldo:</strong> <strong>${formattedAmount}</strong></li>
            <li><strong>Scadenza:</strong> ${daysUntilDue} giorni</li>
          </ul>
          
          <p><strong>Azione richiesta:</strong> Contatta il cliente per sollecitare il pagamento del saldo.</p>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings" class="button">
            Gestisci Prenotazione
          </a>
        </div>
        
        <div class="footer">
          <p>Questa è una notifica automatica del sistema di prenotazioni WeShoot.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `${subject}\n\nUn cliente ha il saldo in scadenza tra ${daysUntilDue} giorni.\n\nCliente: ${userName} (${userEmail})\nTour: ${tourTitle}\nID: ${bookingId}\nImporto: ${formattedAmount}\n\nGestisci: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings`

  return { subject, html, text }
}

export function generateBookingConfirmationEmail(
  userEmail: string,
  userName: string,
  tourTitle: string,
  bookingId: string,
  amount: number,
  paymentType: 'deposit' | 'balance'
): EmailData {
  const formattedAmount = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)

  const subject = paymentType === 'deposit' 
    ? `Conferma Acconto - ${tourTitle}` 
    : `Pagamento Completato - ${tourTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ${paymentType === 'deposit' ? 'Acconto Confermato!' : 'Pagamento Completato!'}</h1>
        </div>
        
        <div class="content">
          <p>Ciao ${userName},</p>
          
          <p>${paymentType === 'deposit' 
            ? 'Il tuo acconto è stato confermato con successo!' 
            : 'Il tuo pagamento è stato completato con successo!'}</p>
          
          <h3>Dettagli Prenotazione</h3>
          <ul>
            <li><strong>Tour:</strong> ${tourTitle}</li>
            <li><strong>ID Prenotazione:</strong> ${bookingId}</li>
            <li><strong>Importo ${paymentType === 'deposit' ? 'Acconto' : 'Pagato'}:</strong> ${formattedAmount}</li>
            <li><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</li>
          </ul>
          
          ${paymentType === 'deposit' ? `
            <p>Il saldo rimanente dovrà essere pagato entro la data indicata nella tua dashboard.</p>
          ` : `
            <p>La tua prenotazione è ora completamente pagata. Ti contatteremo presto con tutti i dettagli del viaggio!</p>
          `}
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" class="button">
            Vai alla Dashboard
          </a>
        </div>
        
        <div class="footer">
          <p>Grazie per aver scelto WeShoot!</p>
          <p>Per assistenza, contatta prenotazioni@weshoot.it</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    to: userEmail,
    subject,
    html,
    text: `${subject}\n\nCiao ${userName},\n\n${paymentType === 'deposit' 
      ? 'Il tuo acconto è stato confermato con successo!' 
      : 'Il tuo pagamento è stato completato con successo!'}\n\nDettagli:\n- Tour: ${tourTitle}\n- ID: ${bookingId}\n- Importo: ${formattedAmount}\n\nVai alla dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
  }
}

export function generatePaymentReminderEmail(
  userEmail: string,
  userName: string,
  tourTitle: string,
  bookingId: string,
  amount: number,
  dueDate: string
): EmailData {
  const formattedAmount = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)

  const subject = `Promemoria Pagamento - ${tourTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Promemoria Pagamento</h1>
        </div>
        
        <div class="content">
          <p>Ciao ${userName},</p>
          
          <p>Ti ricordiamo che hai un pagamento in scadenza per il tour <strong>${tourTitle}</strong>.</p>
          
          <h3>Dettagli Pagamento</h3>
          <ul>
            <li><strong>Tour:</strong> ${tourTitle}</li>
            <li><strong>ID Prenotazione:</strong> ${bookingId}</li>
            <li><strong>Importo da Pagare:</strong> ${formattedAmount}</li>
            <li><strong>Scadenza:</strong> ${new Date(dueDate).toLocaleDateString('it-IT')}</li>
          </ul>
          
          <p>Per completare il pagamento, accedi alla tua dashboard e segui le istruzioni.</p>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" class="button">
            Completa il Pagamento
          </a>
        </div>
        
        <div class="footer">
          <p>Se hai già effettuato il pagamento, ignora questa email.</p>
          <p>Per assistenza, contatta prenotazioni@weshoot.it</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    to: userEmail,
    subject,
    html,
    text: `${subject}\n\nCiao ${userName},\n\nHai un pagamento in scadenza per ${tourTitle}.\n\nImporto: ${formattedAmount}\nScadenza: ${new Date(dueDate).toLocaleDateString('it-IT')}\n\nCompleta il pagamento: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
  }
}
