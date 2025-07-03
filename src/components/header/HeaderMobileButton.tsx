'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderMobileButtonProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const HeaderMobileButton: React.FC<HeaderMobileButtonProps> = ({ 
  isScrolled, 
  isMenuOpen, 
  setIsMenuOpen 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <button
      className="lg:hidden relative z-50 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors touch-manipulation"
      onClick={handleClick}
      aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
      aria-expanded={isMenuOpen}
      type="button"
    >
      {isMenuOpen ? (
        <X className={`h-6 w-6 transition-transform duration-200 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
      ) : (
        <Menu className={`h-6 w-6 transition-transform duration-200 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
      )}
      <span className="sr-only">Menu mobile</span>
    </button>
  );
};

export default HeaderMobileButton;
