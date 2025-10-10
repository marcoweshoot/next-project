import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  sendAdminNotification, 
  generateDepositReminderAdminEmail, 
  generateBalanceReminderAdminEmail 
} from '@/lib/email'

export const runtime = 'nodejs'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// Vercel Cron: https://vercel.com/docs/cron-jobs
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has the correct auth token
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with service role key
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

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Find bookings with deposit_paid status where balance is due soon
    const { data: upcomingBalancePayments, error: balanceError } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', 'deposit_paid')
      .gte('balance_due_date', now.toISOString())
      .lte('balance_due_date', sevenDaysFromNow.toISOString())

    if (balanceError) {
      console.error('Error fetching upcoming balance payments:', balanceError)
    }

    // Send admin notifications for upcoming balance payments
    if (upcomingBalancePayments && upcomingBalancePayments.length > 0) {
      for (const booking of upcomingBalancePayments) {
        try {
          const userName = `${booking.profiles?.first_name || ''} ${booking.profiles?.last_name || ''}`.trim() || 'Cliente'
          const userEmail = booking.profiles?.email || ''
          const dueDate = new Date(booking.balance_due_date)
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          // Only send if it's exactly 7, 3, or 1 day(s) before
          if (daysUntilDue === 7 || daysUntilDue === 3 || daysUntilDue === 1) {
            const balanceAmount = booking.total_amount - booking.deposit_amount
            
            const emailContent = generateBalanceReminderAdminEmail(
              userName,
              userEmail,
              booking.tour_title || 'Tour',
              booking.id,
              balanceAmount,
              daysUntilDue
            )

            await sendAdminNotification(emailContent.subject, emailContent.html, emailContent.text)
            console.log(`✅ Sent balance reminder for booking ${booking.id} (${daysUntilDue} days)`)
          }
        } catch (error) {
          console.error(`Failed to send balance reminder for booking ${booking.id}:`, error)
        }
      }
    }

    // Find bookings with deposit due soon (if you track deposit due dates separately)
    // This is less common but included for completeness
    const { data: upcomingDepositPayments, error: depositError } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', 'deposit_paid')
      .gte('deposit_due_date', now.toISOString())
      .lte('deposit_due_date', threeDaysFromNow.toISOString())

    if (depositError) {
      console.error('Error fetching upcoming deposit payments:', depositError)
    }

    // Send admin notifications for upcoming deposit payments
    if (upcomingDepositPayments && upcomingDepositPayments.length > 0) {
      for (const booking of upcomingDepositPayments) {
        try {
          const userName = `${booking.profiles?.first_name || ''} ${booking.profiles?.last_name || ''}`.trim() || 'Cliente'
          const userEmail = booking.profiles?.email || ''
          const dueDate = new Date(booking.deposit_due_date)
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          // Only send if it's exactly 3 or 1 day(s) before
          if (daysUntilDue === 3 || daysUntilDue === 1) {
            const emailContent = generateDepositReminderAdminEmail(
              userName,
              userEmail,
              booking.tour_title || 'Tour',
              booking.id,
              daysUntilDue
            )

            await sendAdminNotification(emailContent.subject, emailContent.html, emailContent.text)
            console.log(`✅ Sent deposit reminder for booking ${booking.id} (${daysUntilDue} days)`)
          }
        } catch (error) {
          console.error(`Failed to send deposit reminder for booking ${booking.id}:`, error)
        }
      }
    }

    const summary = {
      timestamp: now.toISOString(),
      balanceReminders: upcomingBalancePayments?.length || 0,
      depositReminders: upcomingDepositPayments?.length || 0,
    }

    return NextResponse.json({ 
      success: true,
      message: 'Payment reminders processed',
      summary
    }, { status: 200 })
  } catch (error) {
    console.error('Error processing payment reminders:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

