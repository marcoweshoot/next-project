'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderMobileButtonProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  // usa il tipo di React per poter passare la funzione updater
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // opzionale: id del menu per aria-controls
  menuId?: string;
}

const HeaderMobileButton: React.FC<HeaderMobileButtonProps> = ({
  isScrolled,
  isMenuOpen,
  setIsMenuOpen,
  menuId = 'mobile-nav',
}) => {
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // niente preventDefault su un <button type="button">
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  return (
    <button
      type="button"
      aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
      aria-expanded={isMenuOpen}
      aria-controls={menuId}
      onClick={handleToggle}
      // 44x44 target, z alto e click abilitato
      className="lg:hidden relative z-[100] p-3 h-11 w-11 rounded-md pointer-events-auto touch-manipulation
                 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {isMenuOpen ? (
        <X
          className={`h-6 w-6 transition-transform duration-200 ${
            isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'
          }`}
        />
      ) : (
        <Menu
          className={`h-6 w-6 transition-transform duration-200 ${
            isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'
          }`}
        />
      )}
      <span className="sr-only">{isMenuOpen ? 'Chiudi menu' : 'Apri menu'}</span>
    </button>
  );
};

export default HeaderMobileButton;
