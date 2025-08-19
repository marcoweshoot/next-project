'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HeaderLogoDynamic from './header/HeaderLogoDynamic'
import HeaderMobileButton from './header/HeaderMobileButton'
import { useNavbarScroll } from '@/hooks/useNavbarScroll'

// Code-splitting: questi chunk non finiscono nell'initial JS su mobile
const HeaderDesktopNav = dynamic(() => import('./header/HeaderDesktopNav'), {
  ssr: false,
  loading: () => null,
})
const HeaderMobileNav = dynamic(() => import('./header/HeaderMobileNav'), {
  ssr: false,
  loading: () => null,
})

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const isScrolled = useNavbarScroll()

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(prev => (prev === menu ? null : menu))
  }

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-white/95 md:backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <HeaderLogoDynamic />

          {/* Desktop nav — non SSR, non idratata su mobile */}
          <div className="hidden lg:block">
            <HeaderDesktopNav
              isScrolled={isScrolled}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>

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
