'use client';

import Link from 'next/link';
import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { LoginDropdown } from '@/components/auth/LoginDropdown';

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
  'absolute top-full left-0 w-64 rounded-lg border bg-popover text-popover-foreground ' +
  'shadow-xl opacity-0 invisible translate-y-2 transition-opacity transition-transform duration-150 ' +
  'z-50 group-hover/drop:opacity-100 group-hover/drop:visible group-hover/drop:translate-y-0 ' +
  'group-focus-within/drop:opacity-100 group-focus-within/drop:visible hover:opacity-100 hover:visible hover:translate-y-0';

const HeaderDesktopNav: React.FC<HeaderDesktopNavProps> = ({ isScrolled }) => {
  const pathname = usePathname();
  
  // Rileva se siamo in pagine di autenticazione (ottimizzato)
  const isAuthPage = pathname.startsWith('/auth/') || 
                     pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/admin');
  
  // Link chiari su hero scuro, normali quando la header è "attaccata" allo sfondo della pagina
  // Nelle pagine auth/dashboard/admin usa sempre colori scuri
  const linkColor = isScrolled || isAuthPage ? 'text-foreground' : 'text-white';

  return (
    <nav className="hidden lg:flex items-center flex-nowrap gap-x-2 xl:gap-x-4 2xl:gap-x-6">
      {/* Viaggi Fotografici */}
      <div className="group/drop relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={false}
          className={`flex items-center gap-1 py-2 font-medium transition-colors duration-200 ${linkColor} hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md`}
        >
          <span>Viaggi Fotografici</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Hover bridge */}
        <div className="absolute left-0 top-full h-2 w-64" aria-hidden="true" />

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
                  className="block rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Accademia */}
      <div className="group/drop relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={false}
          className={`flex items-center gap-1 py-2 font-medium transition-colors duration-200 ${linkColor} hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md`}
        >
          <span>Accademia fotografia</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="absolute left-0 top-full h-2 w-64" aria-hidden="true" />

        <div className={menuPanelClasses}>
          <ul className="py-2">
            <li>
              <Link
                href="/corsi-di-fotografia/"
                prefetch={false}
                className="block rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Corsi di fotografia
              </Link>
            </li>
            <li>
              <a
                href="https://accademia.weshoot.it/wp-login"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Accesso membri
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Link singoli */}
      <Link
        href="/fotografi/"
        prefetch={false}
        className={`font-medium transition-colors duration-200 hover:text-primary ${linkColor} hidden xl:block`}
      >
        Coach
      </Link>

      <a
        href="https://blog.weshoot.it/"
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium transition-colors duration-200 hover:text-primary ${linkColor} hidden xl:block`}
      >
        Blog
      </a>

      <Link
        href="/recensioni/"
        prefetch={false}
        className={`font-medium transition-colors duration-200 hover:text-primary ${linkColor} hidden 2xl:block`}
      >
        Dicono di Noi
      </Link>

      <LoginDropdown isScrolled={isScrolled} isAuthPage={isAuthPage} />

      {/* Theme Toggle e CTA Button raggruppati */}
      <div className="flex items-center gap-2">
        <ThemeToggleLazy />
        <Button
          asChild
          className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-200 text-sm xl:text-base"
        >
          <Link href="/viaggi-fotografici/" prefetch={false}>
            <span className="hidden xl:inline">Scopri i Viaggi</span>
            <span className="xl:hidden">Viaggi</span>
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default HeaderDesktopNav;
