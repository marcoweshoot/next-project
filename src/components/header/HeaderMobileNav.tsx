'use client';

import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
  const handleLinkClick = () => setIsMenuOpen(false);

  if (!isMenuOpen) return null;

  return (
    <nav
      className="lg:hidden border-t border-border bg-background shadow-lg dark:shadow-none"
      aria-label="Menu principale mobile"
    >
      <div className="px-4 pt-2 pb-4 space-y-1 max-h-[90vh] overflow-y-auto">
        {/* Viaggi Fotografici */}
        <div>
          <button
            type="button"
            className="flex items-center justify-between w-full px-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md touch-target tap-highlight-none"
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
            <ul id="mobile-viaggi-menu" className="pl-1 mt-1 space-y-1">
              <li>
                <Link
                  href="/viaggi-fotografici/"
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
                  onClick={handleLinkClick}
                  aria-label="Tutti i Viaggi Fotografici"
                >
                  Tutti i Viaggi Fotografici
                </Link>
              </li>
              <li>
                <Link
                  href="/viaggi-fotografici/destinazioni/"
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
                  onClick={handleLinkClick}
                  aria-label="Destinazioni dei Viaggi Fotografici"
                >
                  Destinazioni
                </Link>
              </li>
              <li>
                <Link
                  href="/viaggi-fotografici/calendario/"
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
                  onClick={handleLinkClick}
                  aria-label="Calendario dei Viaggi Fotografici"
                >
                  Calendario Viaggi
                </Link>
              </li>
              <li>
                <Link
                  href="/viaggi-fotografici/collezioni/"
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
                  onClick={handleLinkClick}
                  aria-label="Collezioni di Viaggi Fotografici"
                >
                  Collezioni
                </Link>
              </li>
              <li>
                <Link
                  href="/viaggi-fotografici/storie/"
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
                  onClick={handleLinkClick}
                  aria-label="Storie di Viaggio Fotografico"
                >
                  Storie di viaggio
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Accademia Fotografia */}
        <div>
          <button
            type="button"
            className="flex items-center justify-between w-full px-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md touch-target tap-highlight-none"
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
            <ul id="mobile-accademia-menu" className="pl-1 mt-1 space-y-1">
              <li>
                <Link
                  href="/corsi-di-fotografia/"
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
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
                  className="block text-base text-muted-foreground hover:text-primary rounded-md hover:bg-muted touch-target touch-pad"
                  onClick={handleLinkClick}
                  aria-label="Accesso Membri Accademia WeShoot (si apre in una nuova scheda)"
                >
                  Accesso membri
                </a>
              </li>
            </ul>
          )}
        </div>

        <Link
          href="/fotografi/"
          className="block px-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md touch-target"
          onClick={handleLinkClick}
          aria-label="Pagina dei Coach WeShoot"
        >
          Coach
        </Link>

        <a
          href="https://www.weshoot.it/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md touch-target"
          onClick={handleLinkClick}
          aria-label="Apri il Blog di WeShoot in una nuova finestra"
        >
          Blog
        </a>

        <Link
          href="/recensioni/"
          className="block px-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium rounded-md touch-target"
          onClick={handleLinkClick}
          aria-label="Recensioni dei Clienti"
        >
          Dicono di Noi
        </Link>

        <div className="px-3 py-3">
          {/* shadcn Button asChild: il link eredita le classi e resta l’unico elemento interattivo */}
          <Button
            asChild
            style={{ backgroundColor: '#E25141' }}
            className="w-full h-12 text-base rounded-xl"
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

        <div className="flex justify-center pt-2">
          {/* Assicurati che ThemeToggle rispetti 48x48 */}
          <div className="w-12 h-12 touch-target">
            <ThemeToggle aria-label="Cambia tema (chiaro/scuro)" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderMobileNav;
