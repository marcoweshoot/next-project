'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testConnection = async () => {
    setLoading(true)
    setTestResult('')

    try {
      // Test 1: Check if Supabase client is initialized
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setTestResult(`❌ Errore sessione: ${sessionError.message}`)
        return
      }

      // Test 2: Try to query profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (profilesError) {
        setTestResult(`❌ Errore query profiles: ${profilesError.message}`)
        return
      }

      // Test 3: Try to query bookings table
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1)

      if (bookingsError) {
        setTestResult(`❌ Errore query bookings: ${bookingsError.message}`)
        return
      }

      // Test 4: Try to query reviews table
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .limit(1)

      if (reviewsError) {
        setTestResult(`❌ Errore query reviews: ${reviewsError.message}`)
        return
      }

      setTestResult(`
✅ Connessione Supabase: OK
✅ Tabella profiles: OK (${profiles?.length || 0} record)
✅ Tabella bookings: OK (${bookings?.length || 0} record)  
✅ Tabella reviews: OK (${reviews?.length || 0} record)
✅ Autenticazione: ${session ? 'Utente loggato' : 'Nessun utente loggato'}
      `)

    } catch (error) {
      setTestResult(`❌ Errore generale: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Test Connessione Supabase</CardTitle>
          <CardDescription>
            Verifica che la connessione a Supabase funzioni correttamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading} className="w-full">
            {loading ? 'Testando...' : 'Testa Connessione'}
          </Button>
          
          {testResult && (
            <Alert>
              <AlertDescription className="whitespace-pre-line">
                {testResult}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Variabili d'ambiente richieste:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
