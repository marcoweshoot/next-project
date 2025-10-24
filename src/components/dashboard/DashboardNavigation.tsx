'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  Home,
  Calendar,
  User as UserIcon,
  Star,
  CreditCard,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminRole } from '@/hooks/useAdminRole'

const baseNavigationItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: Home,
  },
  {
    href: '/dashboard/bookings',
    label: 'Prenotazioni',
    icon: Calendar,
  },
  {
    href: '/dashboard/profile',
    label: 'Profilo',
    icon: UserIcon,
  },
  {
    href: '/dashboard/reviews',
    label: 'Recensioni',
    icon: Star,
  },
  {
    href: '/dashboard/payments',
    label: 'Pagamenti',
    icon: CreditCard,
  },
]

const adminNavigationItem = {
  href: '/admin',
  label: 'Admin',
  icon: Settings,
}

export function DashboardNavigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const { isAdmin, isSuperAdmin, loading } = useAdminRole(user)
  const supabase = createClient()


  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const navigationItems = (isAdmin || isSuperAdmin)
    ? [...baseNavigationItems, adminNavigationItem]
    : baseNavigationItems


  return (
    <nav className="flex flex-wrap gap-2">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-2',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
