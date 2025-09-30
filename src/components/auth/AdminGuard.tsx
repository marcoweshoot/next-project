'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useAdminRole } from '@/hooks/useAdminRole'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
  fallback?: React.ReactNode
}

export function AdminGuard({ children, requireSuperAdmin = false, fallback }: AdminGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Verifica permessi...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Devi essere autenticato per accedere a questa sezione.
        </AlertDescription>
      </Alert>
    )
  }

  const hasRequiredPermission = requireSuperAdmin ? isSuperAdmin : isAdmin

  if (!hasRequiredPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Non hai i permessi necessari per accedere a questa sezione.
          {requireSuperAdmin ? ' Richiesto: Super Admin' : ' Richiesto: Admin'}
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
