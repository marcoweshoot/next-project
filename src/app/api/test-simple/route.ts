import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Test endpoint funziona!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })
}
