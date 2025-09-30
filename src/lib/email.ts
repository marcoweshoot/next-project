// Email service for sending notifications
// This is a basic implementation - in production you'd use a service like SendGrid, Resend, or AWS SES

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:')
      console.log('To:', emailData.to)
      console.log('Subject:', emailData.subject)
      console.log('HTML:', emailData.html)
      return true
    }

    // In production, you would integrate with your email service here
    // Example with Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: 'noreply@weshoot.it',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    })
    
    if (error) {
      console.error('Error sending email:', error)
      return false
    }
    
    return true
    */

    // For now, return true to simulate successful sending
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
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
