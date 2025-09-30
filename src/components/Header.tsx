'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import HeaderLogoDynamic from './header/HeaderLogoDynamic'
import HeaderMobileButton from './header/HeaderMobileButton'
import { useNavbarScroll } from '@/hooks/useNavbarScroll'

// Code-splitting: questi chunk non finiscono nell'initial JS su mobile
const HeaderMobileNav = dynamic(() => import('./header/HeaderMobileNav'))
const HeaderDesktopNav = dynamic(() => import('./header/HeaderDesktopNav'), {
  ssr: false,
  loading: () => (
    // riserva lo spazio della navbar desktop finché il chunk si carica
    <nav aria-hidden className="hidden lg:block h-20 w-full" />
  ),
});

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const isScrolled = useNavbarScroll()

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(prev => (prev === menu ? null : menu))
  }
    // Aggiorna stato desktop/mobile
    useEffect(() => {
      const mq = window.matchMedia('(min-width: 1024px)')
      const update = () => setIsDesktop(mq.matches)
      update()
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }, [])

  // Chiudi il menu quando passi a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
        setActiveDropdown(null)
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Click outside: attivo SOLO quando il menu è aperto
  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        !target.closest('.mobile-menu-container') &&
        !target.closest('button[aria-label*="menu"]')
      ) {
        setIsMenuOpen(false)
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside, { passive: true })
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  const pathname = usePathname();
  
  // Rileva se siamo in pagine di autenticazione (ottimizzato)
  const isAuthPage = pathname.startsWith('/auth/') || 
                     pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/admin');

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 will-change-transform ${
        isScrolled
          ? // tema-aware: sfondo della navbar quando è attaccata
            'border-b border-border shadow-sm supports-[backdrop-filter]:bg-background/60 bg-background/80 backdrop-blur'
          : isAuthPage
          ? // nelle pagine auth: semi-trasparente per leggibilità
            'bg-background/20 backdrop-blur-sm'
          : // sopra l'hero: trasparente
            'bg-transparent'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <HeaderLogoDynamic />

          {/* Desktop nav — render solo su viewport desktop: NO download su mobile */}
          {isDesktop && (
            <div className="hidden lg:block">
              <HeaderDesktopNav
                isScrolled={isScrolled}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
              />
            </div>
          )}

          {/* Bottone mobile è leggero e resta client */}
          <HeaderMobileButton
            isScrolled={isScrolled}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>

        {/* Mobile menu: il codice viene scaricato SOLO quando apri il menu */}
        <div className="mobile-menu-container lg:hidden">
          {isMenuOpen ? (
            <HeaderMobileNav
              isMenuOpen={isMenuOpen}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
              setIsMenuOpen={setIsMenuOpen}
            />
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
