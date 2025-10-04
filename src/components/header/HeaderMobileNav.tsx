'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface HeaderMobileNavProps {
  isMenuOpen: boolean;
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMenuOpen: (open: boolean) => void;
}

const HeaderMobileNav: React.FC<HeaderMobileNavProps> = ({
  isMenuOpen,
  activeDropdown,
  toggleDropdown,
  setIsMenuOpen,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setUser(user);
    };
    
    checkAuth();
  }, []);

  const handleLinkClick = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
    setIsMenuOpen(false);
  };

  if (!isMenuOpen) return null;

  return (
    <nav
      className="lg:hidden border-t border-border bg-background shadow-lg"
      aria-label="Menu principale mobile"
    >
      <div className="max-h-[90vh] overflow-y-auto space-y-1 px-4 pt-2 pb-4">
        {/* Viaggi Fotografici */}
        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background tap-highlight-none"
            onClick={() => toggleDropdown('mobile-viaggi')}
            aria-expanded={activeDropdown === 'mobile-viaggi'}
            aria-controls="mobile-viaggi-menu"
          >
            <span>Viaggi Fotografici</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${activeDropdown === 'mobile-viaggi' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {activeDropdown === 'mobile-viaggi' && (
            <ul id="mobile-viaggi-menu" className="mt-1 space-y-1 pl-1">
              {[
                ['/viaggi-fotografici/', 'Tutti i Viaggi Fotografici', 'Tutti i Viaggi Fotografici'],
                ['/viaggi-fotografici/destinazioni/', 'Destinazioni', 'Destinazioni dei Viaggi Fotografici'],
                ['/viaggi-fotografici/calendario/', 'Calendario Viaggi', 'Calendario dei Viaggi Fotografici'],
                ['/viaggi-fotografici/collezioni/', 'Collezioni', 'Collezioni di Viaggi Fotografici'],
                ['/viaggi-fotografici/storie/', 'Storie di viaggio', 'Storie di Viaggio Fotografico'],
              ].map(([href, label, aria]) => (
                <li key={href as string}>
                  <Link
                    href={href as string}
                    className="block rounded-md text-base text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target touch-pad tap-highlight-none"
                    onClick={handleLinkClick}
                    aria-label={aria as string}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Accademia Fotografia */}
        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background tap-highlight-none"
            onClick={() => toggleDropdown('mobile-accademia')}
            aria-expanded={activeDropdown === 'mobile-accademia'}
            aria-controls="mobile-accademia-menu"
          >
            <span>Accademia fotografia</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${activeDropdown === 'mobile-accademia' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {activeDropdown === 'mobile-accademia' && (
            <ul id="mobile-accademia-menu" className="mt-1 space-y-1 pl-1">
              <li>
                <Link
                  href="/corsi-di-fotografia/"
                  className="block rounded-md text-base text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target touch-pad tap-highlight-none"
                  onClick={handleLinkClick}
                  aria-label="Corsi di Fotografia"
                >
                  Corsi di fotografia
                </Link>
              </li>
              <li>
                <a
                  href="https://accademia.weshoot.it/wp-login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md text-base text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target touch-pad tap-highlight-none"
                  onClick={handleLinkClick}
                  aria-label="Accesso Membri Accademia WeShoot (si apre in una nuova scheda)"
                >
                  Accesso membri
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Link singoli */}
        <Link
          href="/fotografi/"
          className="block rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
          onClick={handleLinkClick}
          aria-label="Pagina dei Coach WeShoot"
        >
          Coach
        </Link>

        <a
          href="https://blog.weshoot.it/"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
          onClick={handleLinkClick}
          aria-label="Apri il Blog di WeShoot in una nuova finestra"
        >
          Blog
        </a>

        <Link
          href="/recensioni/"
          className="block rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
          onClick={handleLinkClick}
          aria-label="Recensioni dei Clienti"
        >
          Dicono di Noi
        </Link>

        {/* Login/Logout Section */}
        <div className="border-t border-border pt-3">
          {isLoggedIn ? (
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="block rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
                onClick={handleLinkClick}
                aria-label="Vai alla Dashboard"
              >
                Dashboard
              </Link>
              <button
                className="block w-full rounded-md px-3 py-2 text-left font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
                onClick={handleLogout}
              >
                Esci
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/auth/login"
                className="block rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
                onClick={handleLinkClick}
                aria-label="Accedi al tuo account"
              >
                Accedi
              </Link>
              <Link
                href="/auth/register"
                className="block rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-target tap-highlight-none"
                onClick={handleLinkClick}
                aria-label="Registrati per un nuovo account"
              >
                Registrati
              </Link>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-3 py-3">
          <Button
            asChild
            className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background text-base"
          >
            <Link
              href="/viaggi-fotografici/"
              onClick={handleLinkClick}
              aria-label="Scopri i Viaggi Fotografici"
              className="tap-highlight-none"
            >
              Scopri i Viaggi
            </Link>
          </Button>
        </div>

        {/* Theme toggle */}
        <div className="flex justify-center pt-2">
          <div className="h-12 w-12 touch-target">
            <ThemeToggle aria-label="Cambia tema (chiaro/scuro)" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderMobileNav;
