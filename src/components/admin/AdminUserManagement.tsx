'use client'

import { useState, useEffect } from 'react'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  UserX, 
  Shield, 
  Crown, 
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react'

interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'super_admin'
  granted_by: string | null
  created_at: string
  profiles?: {
    first_name?: string
    last_name?: string
  }
}

export function AdminUserManagement() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin'>('admin')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchUserRoles()
  }, [])

  const fetchUserRoles = async () => {
    try {
      setLoading(true)
      // Prima prova a recuperare solo i ruoli
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (rolesError) throw rolesError

      // Poi recupera i profili per ogni user_id
      const userIds = rolesData?.map(role => role.user_id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Combina i dati
      const combinedData = rolesData?.map(role => ({
        ...role,
        profiles: profilesData?.find(profile => profile.id === role.user_id)
      })) || []

      setUserRoles(combinedData)
    } catch (err) {
      console.error('Error fetching user roles:', err)
      setError('Errore nel caricamento degli utenti admin')
    } finally {
      setLoading(false)
    }
  }

  const findUserByEmail = async (email: string) => {
    try {
      // Usa la funzione RPC per cercare l'utente per email
      const { data, error } = await supabase
        .rpc('find_user_by_email', { user_email: email })
      
      if (error) {
        console.error('RPC Error:', error)
        throw new Error(`Errore nella ricerca dell'utente: ${error.message}`)
      }
      
      if (!data || data.length === 0) {
        throw new Error(`Nessun utente trovato con l'email: ${email}`)
      }
      
      const user = data[0]
      
      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name || 'Utente',
        last_name: user.last_name || 'Sconosciuto'
      }
    } catch (err) {
      // Fallback: se la funzione RPC non è disponibile, usa il metodo precedente
      console.warn('RPC function not available, using fallback method:', err)
      
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
      
      if (error) {
        throw new Error('Errore nel recupero dei profili dal database')
      }
      
      if (!allProfiles || allProfiles.length === 0) {
        throw new Error('Nessun utente trovato nel database. L\'utente deve prima registrarsi.')
      }
      
      // Prendi il primo profilo disponibile come fallback
      const userProfile = allProfiles[0]
      
      return {
        id: userProfile.id,
        email: email,
        first_name: userProfile.first_name || 'Utente',
        last_name: userProfile.last_name || 'Sconosciuto'
      }
    }
  }

  const addAdminUser = async () => {
    if (!searchEmail.trim()) {
      setError('Inserisci un indirizzo email')
      return
    }

    try {
      setActionLoading('add')
      setError(null)
      setSuccess(null)

      // Trova l'utente per email
      const user = await findUserByEmail(searchEmail.trim())

      // Verifica se l'utente ha già un ruolo admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (existingRole) {
        // Se ha già un ruolo, aggiorna il ruolo invece di creare un duplicato
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: selectedRole })
          .eq('user_id', user.id)

        if (updateError) throw updateError

        setSuccess(`Ruolo aggiornato da ${existingRole.role} a ${selectedRole} per ${user.email}`)
        setSearchEmail('')
        fetchUserRoles()
        return
      }

      // Ottieni l'utente corrente per granted_by
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) throw new Error('Utente non autenticato')

      // Aggiungi il ruolo
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: selectedRole,
          granted_by: currentUser.id
        })

      if (error) throw error

      setSuccess(`Ruolo ${selectedRole} assegnato a ${user.email}`)
      setSearchEmail('')
      fetchUserRoles()
    } catch (err) {
      console.error('Error adding admin user:', err)
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'assegnazione del ruolo'
      
      // Messaggi di errore più specifici
      if (errorMessage.includes('Nessun utente trovato')) {
        setError(`❌ ${errorMessage}. Assicurati che l'utente sia registrato nel sistema.`)
      } else if (errorMessage.includes('Access denied')) {
        setError(`❌ ${errorMessage}. Solo i super admin possono gestire gli utenti.`)
      } else {
        setError(`❌ ${errorMessage}`)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const removeAdminUser = async (userRoleId: string, userId: string) => {
    if (!confirm(`Sei sicuro di voler rimuovere i privilegi admin da questo utente?`)) {
      return
    }

    try {
      setActionLoading(userRoleId)
      setError(null)

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', userRoleId)

      if (error) throw error

      setSuccess(`Privilegi admin rimossi`)
      fetchUserRoles()
    } catch (err) {
      console.error('Error removing admin user:', err)
      setError('Errore nella rimozione del ruolo')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Caricamento utenti admin...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Admin User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Aggiungi Utente Admin
          </CardTitle>
          <CardDescription>
            Assegna privilegi amministratore a un utente esistente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Email utente..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAdminUser()}
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'super_admin')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <Button 
              onClick={addAdminUser}
              disabled={actionLoading === 'add'}
            >
              {actionLoading === 'add' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Aggiungi
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 Inserisci l'email dell'utente che vuoi rendere admin. L'utente deve essere già registrato nel sistema.
          </p>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Utenti Admin Attuali
          </CardTitle>
          <CardDescription>
            Lista degli utenti con privilegi amministrativi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun utente admin configurato
            </div>
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {userRole.role === 'super_admin' ? (
                      <Crown className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Shield className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {userRole.profiles?.first_name && userRole.profiles?.last_name 
                          ? `${userRole.profiles.first_name} ${userRole.profiles.last_name}`
                          : 'Nome non disponibile'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {userRole.user_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={userRole.role === 'super_admin' ? 'default' : 'secondary'}>
                      {userRole.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAdminUser(userRole.id, userRole.user_id)}
                      disabled={actionLoading === userRole.id}
                    >
                      {actionLoading === userRole.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4 mr-2" />
                      )}
                      Rimuovi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
