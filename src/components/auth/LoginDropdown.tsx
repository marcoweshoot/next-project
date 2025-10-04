'use client'

import { useState, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CompactLoginForm } from './CompactLoginForm'
import { LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LoginDropdownProps {
  isScrolled?: boolean
}

export function LoginDropdown({ isScrolled }: LoginDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setUser(user)
    }
    
    checkAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  const handleLoginSuccess = () => {
    setIsOpen(false)
    setIsLoggedIn(true)
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className={`font-medium transition-colors duration-200 hover:text-primary ${
            isScrolled ? 'text-foreground' : 'text-gray-800 dark:text-white'
          }`}
        >
          <span className="hidden xl:inline">Dashboard</span>
          <span className="xl:hidden">Dashboard</span>
        </button>
        <button
          onClick={handleLogout}
          className={`font-medium transition-colors duration-200 hover:text-primary ${
            isScrolled ? 'text-foreground' : 'text-gray-800 dark:text-white'
          }`}
        >
          Esci
        </button>
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 font-medium transition-colors duration-200 hover:text-primary ${
            isScrolled ? 'text-foreground' : 'text-gray-800 dark:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden xl:inline">Accedi</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Accedi al tuo account</h3>
            <p className="text-sm text-muted-foreground">
              Accedi per gestire le tue prenotazioni
            </p>
          </div>
          
          <CompactLoginForm 
            onSuccess={handleLoginSuccess}
            onError={() => {}} // Gestito internamente
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
