
import Link from "next/link";
import React from 'react';
import { Camera, Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white" style={{ backgroundColor: '#303030' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/759cd14e-fb23-4e8f-ad1a-d8a690a28a83.png" 
                alt="WeShoot.it" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-300">
              Esplora il mondo attraverso l'obiettivo. Viaggi fotografici unici 
              con i migliori coach professionali.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/weshoot_official/" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/weshootcommunity" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@WeShoot" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Link Rapidi</h3>
            <ul className="space-y-2">
              <li><Link href="/viaggi-fotografici" className="text-gray-300 hover:text-white transition-colors">Viaggi Fotografici</Link></li>
              <li><Link href="/viaggi-fotografici/destinazioni" className="text-gray-300 hover:text-white transition-colors">Destinazioni</Link></li>
              <li><Link href="/fotografi" className="text-gray-300 hover:text-white transition-colors">I Nostri Coach</Link></li>
              <li><Link href="/viaggi-fotografici/storie" className="text-gray-300 hover:text-white transition-colors">Storie di Viaggio</Link></li>
              <li><Link href="/corsi-di-fotografia" className="text-gray-300 hover:text-white transition-colors">Corsi Online</Link></li>
              <li><Link href="/gift-card" className="text-gray-300 hover:text-white transition-colors">Carte Regalo</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supporto</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contatti" className="text-gray-300 hover:text-white transition-colors">Contattaci</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Termini e Condizioni</Link></li>
              <li><Link href="/gdpr" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellazione" className="text-gray-300 hover:text-white transition-colors">Politica di Cancellazione</Link></li>
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
                <span className="text-gray-300">+393495269093</span>
              </div>             
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} WeShoot.it. Tutti i diritti riservati - P.IVA IT14945891001 
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/cookie-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
            <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
