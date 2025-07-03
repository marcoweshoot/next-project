'use client';

import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface HeaderMobileNavProps {
  isMenuOpen: boolean;
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMenuOpen: (open: boolean) => void;
}

const HeaderMobileNav: React.FC<{
  children?: React.ReactNode;
}> = ({
  isMenuOpen,
  activeDropdown,
  toggleDropdown,
  setIsMenuOpen,
  children
}) => {
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  if (!isMenuOpen) return null;

  return (
    <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
      <div className="px-4 pt-2 pb-4 space-y-1 max-h-screen overflow-y-auto">
        {/* Mobile Viaggi Fotografici */}
        <div>
          <button 
            className="flex items-center justify-between w-full px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium rounded-md"
            onClick={() => toggleDropdown('mobile-viaggi')}
          >
            <span>Viaggi Fotografici</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === 'mobile-viaggi' ? 'rotate-180' : ''}`} />
          </button>
          {activeDropdown === 'mobile-viaggi' && (
            <div className="pl-4 space-y-1 mt-2">
              <Link 
                href="/viaggi-fotografici/" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Tutti i Viaggi Fotografici
              </Link>
              <Link 
                href="/viaggi-fotografici/destinazioni/" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Destinazioni
              </Link>
              <Link 
                href="/viaggi-fotografici/calendario/" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Calendario Viaggi
              </Link>
              <Link 
                href="/viaggi-fotografici/collezioni/" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Collezioni
              </Link>
              <Link 
                href="/viaggi-fotografici/storie/" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Storie di viaggio
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Accademia Fotografia */}
        <div>
          <button 
            className="flex items-center justify-between w-full px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium rounded-md"
            onClick={() => toggleDropdown('mobile-accademia')}
          >
            <span>Accademia fotografia</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === 'mobile-accademia' ? 'rotate-180' : ''}`} />
          </button>
          {activeDropdown === 'mobile-accademia' && (
            <div className="pl-4 space-y-1 mt-2">
              <Link 
                href="/corsi-di-fotografia/" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Corsi di fotografia
              </Link>
              <a 
                href="https://accademia.weshoot.it/wp-login" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Accesso membri
              </a>
            </div>
          )}
        </div>

        {/* Mobile Coach */}
        <Link 
          href="/fotografi/" 
          className="block px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium rounded-md"
          onClick={handleLinkClick}
        >
          Coach
        </Link>

        {/* Mobile Blog */}
        <a 
          href="https://www.weshoot.it/blog" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium rounded-md"
          onClick={handleLinkClick}
        >
          Blog
        </a>

        {/* Mobile Dicono di Noi */}
        <Link 
          href="/recensioni/" 
          className="block px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium rounded-md"
          onClick={handleLinkClick}
        >
          Dicono di Noi
        </Link>

        {/* Mobile CTA */}
        <div className="px-3 py-3">
          <Button asChild style={{ backgroundColor: '#E25141' }} className="w-full hover:opacity-90 text-base py-3">
            <Link href="/viaggi-fotografici/" onClick={handleLinkClick}>
              Scopri i Viaggi
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMobileNav;
