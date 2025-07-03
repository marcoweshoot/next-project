"use client"

'use client';

import React, { useState, useEffect } from 'react';
import HeaderLogo from './header/HeaderLogo';
import HeaderDesktopNav from './header/HeaderDesktopNav';
import HeaderMobileButton from './header/HeaderMobileButton';
import HeaderMobileNav from './header/HeaderMobileNav';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const isScrolled = useNavbarScroll();

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // Close mobile menu when clicking outside or on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu-container') && !target.closest('button[aria-label*="menu"]')) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <HeaderLogo isScrolled={isScrolled} />

          <HeaderDesktopNav 
            isScrolled={isScrolled}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
          />

          <HeaderMobileButton 
            isScrolled={isScrolled}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>

        <div className="mobile-menu-container">
          <HeaderMobileNav 
            isMenuOpen={isMenuOpen}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
