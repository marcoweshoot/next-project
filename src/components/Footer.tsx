// src/components/Footer.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Phone
} from 'lucide-react';
import { openCookiePreferences } from '@/integrations/cookieConsent';

// Compute once at build time for SSG
const currentYear = new Date().getFullYear();

// Static link definitions
const QUICK_LINKS = [
  { href: '/viaggi-fotografici', label: '✈️ Viaggi Fotografici' },
  { href: '/viaggi-fotografici/calendario', label: '📅 Calendario Viaggi Fotografici' },
  { href: '/viaggi-fotografici/destinazioni', label: '🌍 Destinazioni' },
  { href: '/fotografi', label: '👨‍🎓 Scopri i tuoi Coach' },
  { href: '/recensioni', label: '💬 Recensioni' },
  { href: '/viaggi-fotografici/storie', label: '📚 Storie di Viaggio' },
  { href: '/corsi-di-fotografia', label: '🎓 Corsi di Fotografia Online' },
  { href: 'https://accademia.weshoot.it/', label: '🏫 Accademia WeShoot' },
];

const SUPPORT_LINKS = [
  { href: '/chi-siamo', label: '👨‍💻 Chi Siamo' },
  { href: '/contatti', label: '📱 Contattaci' },
  { href: '/terms', label: '📄 Termini e Condizioni' },
  { href: '/gdpr', label: '🔒 Privacy Policy' },
];

const Footer: React.FC = () => (
  <footer className="text-white" style={{ backgroundColor: '#303030' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2" aria-label="WeShoot Home">
            <Image
              src="/lovable-uploads/logo-light.svg"
              alt="WeShoot - viaggi fotografici e workshop"
              width={120}
              height={48}
              // niente priority: non è LCP
            />
          </Link>
          <p className="text-gray-300">
            Esplora il mondo attraverso l'obiettivo. Viaggi fotografici unici con i migliori coach professionali.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://www.instagram.com/weshoot_official/"
              aria-label="Seguici su Instagram"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/weshootcommunity"
              aria-label="Seguici su Facebook"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.youtube.com/@WeShoot"
              aria-label="Seguici su YouTube"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Link Rapidi</h3>
          <ul className="space-y-2">
            {QUICK_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-gray-300 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Supporto</h3>
          <ul className="space-y-2">
            {SUPPORT_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-gray-300 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contatti</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-gray-300">info@weshoot.it</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-gray-300">+39 349 526 9093</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">
          © {currentYear} WeShoot.it. Tutti i diritti riservati - P.IVA IT14945891001
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/cookie-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
            Cookie Policy
          </Link>
          <button
            type="button"
            onClick={() => openCookiePreferences()}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Gestisci preferenze cookie
          </button>
        </div>
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);
