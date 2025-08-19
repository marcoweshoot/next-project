'use client';

import Link from 'next/link';
import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const ThemeToggleLazy = dynamic(
  () => import('@/components/ui/theme-toggle').then(m => m.ThemeToggle),
  { ssr: false, loading: () => null }
);

type HeaderDesktopNavProps = {
  isScrolled?: boolean;
  activeDropdown?: string | null;
  toggleDropdown?: (menu: string) => void;
};

const menuPanelClasses =
  'absolute top-full left-0 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ' +
  'shadow-xl rounded-lg opacity-0 invisible translate-y-2 transition-opacity transition-transform duration-150 ' +
  'z-50 group-hover/drop:opacity-100 group-hover/drop:visible group-hover/drop:translate-y-0 ' +
  'group-focus-within/drop:opacity-100 group-focus-within/drop:visible hover:opacity-100 hover:visible hover:translate-y-0';

const HeaderDesktopNav: React.FC<HeaderDesktopNavProps> = ({ isScrolled }) => {
  const linkColor = isScrolled ? 'text-gray-800 dark:text-white' : 'text-white';

  return (
    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
      {/* Viaggi Fotografici */}
      <div className="relative group/drop">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={false}
          className={`flex items-center gap-1 font-medium transition-colors duration-200 py-2 ${linkColor} hover:text-primary`}
        >
          <span>Viaggi Fotografici</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Hover bridge: copre il gap tra bottone e menu */}
        <div className="absolute left-0 top-full w-64 h-2" aria-hidden="true" />

        <div className={menuPanelClasses}>
          <ul className="py-2">
            {[
              { href: '/viaggi-fotografici/', label: 'Tutti i Viaggi Fotografici' },
              { href: '/viaggi-fotografici/destinazioni/', label: 'Destinazioni' },
              { href: '/viaggi-fotografici/calendario/', label: 'Calendario Viaggi' },
              { href: '/viaggi-fotografici/collezioni/', label: 'Collezioni' },
              { href: '/viaggi-fotografici/storie/', label: 'Storie di viaggio' },
            ].map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Accademia */}
      <div className="relative group/drop">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={false}
          className={`flex items-center gap-1 font-medium transition-colors duration-200 py-2 ${linkColor} hover:text-primary`}
        >
          <span>Accademia fotografia</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Hover bridge */}
        <div className="absolute left-0 top-full w-64 h-2" aria-hidden="true" />

        <div className={menuPanelClasses}>
          <ul className="py-2">
            <li>
              <Link
                href="/corsi-di-fotografia/"
                prefetch={false}
                className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm font-medium">Corsi di fotografia</span>
              </Link>
            </li>
            <li>
              <a
                href="https://accademia.weshoot.it/wp-login"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm font-medium">Accesso membri</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Link singoli */}
      <Link
        href="/fotografi/"
        prefetch={false}
        className={`font-medium transition-colors duration-200 hover:text-primary ${linkColor}`}
      >
        Coach
      </Link>

      <a
        href="https://www.weshoot.it/blog"
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium transition-colors duration-200 hover:text-primary ${linkColor}`}
      >
        Blog
      </a>

      <Link
        href="/recensioni/"
        prefetch={false}
        className={`font-medium transition-colors duration-200 hover:text-primary ${linkColor}`}
      >
        Dicono di Noi
      </Link>

      <ThemeToggleLazy />

      <div className="flex items-center">
        <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
          <Link href="/viaggi-fotografici/" prefetch={false}>
            Scopri i Viaggi
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default HeaderDesktopNav;
