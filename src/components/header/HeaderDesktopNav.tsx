'use client';

import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface HeaderDesktopNavProps {
  isScrolled: boolean;
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
}

const HeaderDesktopNav: React.FC<{
  children?: React.ReactNode;
}> = ({
  isScrolled,
  activeDropdown,
  toggleDropdown,
  children
}) => {
  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {/* Viaggi Fotografici Dropdown */}
      <div className="relative group">
        <button 
          className={`flex items-center space-x-1 hover:text-primary transition-colors duration-200 py-2 font-medium ${
            isScrolled ? 'text-gray-700' : 'text-white'
          }`}
          onClick={() => toggleDropdown('viaggi')}
        >
          <span>Viaggi Fotografici</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <ul className="py-2">
            <li>
              <Link href="/viaggi-fotografici/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                <div className="text-sm font-medium">Tutti i Viaggi Fotografici</div>
              </Link>
            </li>
            <li>
              <Link href="/viaggi-fotografici/destinazioni/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                <div className="text-sm font-medium">Destinazioni</div>
              </Link>
            </li>
            <li>
              <Link href="/viaggi-fotografici/calendario/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                <div className="text-sm font-medium">Calendario Viaggi</div>
              </Link>
            </li>
            <li>
              <Link href="/viaggi-fotografici/collezioni/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                <div className="text-sm font-medium">Collezioni</div>
              </Link>
            </li>
            <li>
              <Link href="/viaggi-fotografici/storie/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                <div className="text-sm font-medium">Storie di viaggio</div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/* Accademia Fotografia Dropdown */}
      <div className="relative group">
        <button 
          className={`flex items-center space-x-1 hover:text-primary transition-colors duration-200 py-2 font-medium ${
            isScrolled ? 'text-gray-700' : 'text-white'
          }`}
          onClick={() => toggleDropdown('accademia')}
        >
          <span>Accademia fotografia</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <ul className="py-2">
            <li>
              <Link href="/corsi-di-fotografia/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                <div className="text-sm font-medium">Corsi di fotografia</div>
              </Link>
            </li>
            <li>
              <a 
                href="https://accademia.weshoot.it/wp-login" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
              >
                <div className="text-sm font-medium">Accesso membri</div>
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Fotografi */}
      <Link 
        href="/fotografi/" 
        className={`hover:text-primary transition-colors duration-200 font-medium ${
          isScrolled ? 'text-gray-700' : 'text-white'
        }`}
      >
        Coach
      </Link>
      {/* Blog */}
      <a 
        href="https://www.weshoot.it/blog" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`hover:text-primary transition-colors duration-200 font-medium ${
          isScrolled ? 'text-gray-700' : 'text-white'
        }`}
      >
        Blog
      </a>
      {/* Dicono di Noi */}
      <Link 
        href="/recensioni/" 
        className={`hover:text-primary transition-colors duration-200 font-medium ${
          isScrolled ? 'text-gray-700' : 'text-white'
        }`}
      >
        Dicono di Noi
      </Link>
      {/* CTA Button */}
      <div className="flex items-center">
        <Button asChild style={{ backgroundColor: '#E25141' }} className="hover:opacity-90">
          <Link href="/viaggi-fotografici/">
            Scopri i Viaggi
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default HeaderDesktopNav;
