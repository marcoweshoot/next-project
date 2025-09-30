'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AdminRole {
  isAdmin: boolean
  isSuperAdmin: boolean
  loading: boolean
}

export function useAdminRole(user: User | null): AdminRole {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false)
        setIsSuperAdmin(false)
        setLoading(false)
        return
      }

      try {
        // Usa la funzione del database invece di query diretta per evitare problemi RLS
        const { data: isAdminResult, error: adminError } = await supabase
          .rpc('is_admin', { user_uuid: user.id })

        const { data: isSuperAdminResult, error: superAdminError } = await supabase
          .rpc('is_super_admin', { user_uuid: user.id })

        if (adminError || superAdminError) {
          console.error('Error checking admin role:', adminError || superAdminError)
          setIsAdmin(false)
          setIsSuperAdmin(false)
        } else {
          setIsAdmin(isAdminResult || false)
          setIsSuperAdmin(isSuperAdminResult || false)
        }
      } catch (err) {
        console.error('Error in checkAdminRole:', err)
        setIsAdmin(false)
        setIsSuperAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user, supabase])

  return { isAdmin, isSuperAdmin, loading }
}