'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useAdminRole } from '@/hooks/useAdminRole'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function AdminDebug() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useAdminRole(user)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const checkRoles = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Controlla direttamente la tabella user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)

      // Controlla le funzioni RPC
      const { data: isAdminResult, error: adminError } = await supabase
        .rpc('is_admin', { user_uuid: user.id })

      const { data: isSuperAdminResult, error: superAdminError } = await supabase
        .rpc('is_super_admin', { user_uuid: user.id })

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email
        },
        userRoles: userRoles || [],
        rolesError,
        isAdminResult,
        adminError,
        isSuperAdminResult,
        superAdminError,
        hookResults: {
          isAdmin,
          isSuperAdmin,
          roleLoading
        }
      })
    } catch (err) {
      console.error('Debug error:', err)
      setDebugInfo({ error: err })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Caricamento...</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Debug Ruoli Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Stato Utente</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {user ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>Autenticato: {user ? 'Sì' : 'No'}</span>
              </div>
              {user && (
                <>
                  <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                  <div className="text-sm text-muted-foreground">Email: {user.email}</div>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Hook Results</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {roleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 isAdmin ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>isAdmin: {isAdmin ? 'Sì' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                {roleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 isSuperAdmin ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>isSuperAdmin: {isSuperAdmin ? 'Sì' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                {roleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                <span>Loading: {roleLoading ? 'Sì' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={checkRoles} disabled={loading || !user}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Verifica Ruoli
        </Button>

        {debugInfo && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Informazioni Debug</h4>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {!isAdmin && !roleLoading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Non hai i permessi admin. Se dovresti averli, clicca "Verifica Ruoli" per controllare lo stato.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
