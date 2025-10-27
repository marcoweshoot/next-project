import { NextRequest, NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.metadata?.type !== 'gift_card') {
      return NextResponse.json(
        { error: 'Invalid session or not a gift card purchase' },
        { status: 404 }
      );
    }

    // Get gift card from database
    const supabase = await createServerClientSupabase();
    
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error || !giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found' },
        { status: 404 }
      );
    }

    // Format the response
    const giftCardData = {
      amount: giftCard.amount / 100, // Convert from cents
      code: giftCard.code,
      status: giftCard.status,
      created_at: giftCard.created_at,
      expires_at: giftCard.expires_at,
      remaining_balance: giftCard.remaining_balance / 100, // Convert from cents
    };

    return NextResponse.json({
      success: true,
      giftCard: giftCardData
    });

  } catch (error) {
    console.error('Error fetching gift card data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
