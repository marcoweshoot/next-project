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
    // In development, just log the email
    if (process.env.NODE_ENV === 'development' && !process.env.BREVO_API_KEY) {
      console.log('📧 Email would be sent:')
      console.log('From:', emailData.from || DEFAULT_FROM_EMAIL)
      console.log('To:', emailData.to)
      console.log('Subject:', emailData.subject)
      console.log('HTML:', emailData.html.substring(0, 200) + '...')
      return true
    }

    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️ BREVO_API_KEY not configured. Email not sent.')
      return false
    }

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

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    console.log('✅ Email sent successfully:', result.response.statusCode)
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
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
