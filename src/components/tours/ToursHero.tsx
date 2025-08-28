'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { MapPin, Users, Star, Search } from 'lucide-react';

interface ToursHeroProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  heroImage?: { url: string; alternativeText?: string };
  resultsRef?: React.RefObject<HTMLElement>;
  resultsOffsetPx?: number;
  resultsId?: string;
  onSubmitSearch?: () => Promise<void> | void; // ✅ nuovo
}

const ToursHero: React.FC<ToursHeroProps> = ({
  searchTerm,
  onSearchChange,
  heroImage,
  resultsRef,
  resultsOffsetPx = 0,
  resultsId = 'tours-list',
  onSubmitSearch,
}) => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici' },
  ];

  const videoUrl =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/videos/weshoot-viaggi-fotografici-destinazioni.mp4';

  const scrollToResults = () => {
    const el =
      resultsRef?.current ??
      (resultsId ? (document.getElementById(resultsId) as HTMLElement | null) : null);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (resultsOffsetPx ?? 0);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 1) se previsto, carica più pagine finché trovi risultati
    if (onSubmitSearch) await onSubmitSearch();
    // 2) poi scrolla ai risultati
    requestAnimationFrame(scrollToResults);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif"
          className="w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg text-white">
            Viaggi Fotografici
          </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 drop-shadow-md text-white">
          Esplora il mondo attraverso l&apos;obiettivo della tua fotocamera.
          Destinazioni mozzafiato, coach esperti e piccoli gruppi per un&apos;esperienza unica.
        </p>

          {/* Search Field */}
          <div className="max-w-lg mx-auto mb-8">
            <form onSubmit={handleSubmit} className="relative">
              <label htmlFor="tour-search" className="sr-only">
                Cerca destinazione o tour
              </label>

              <button
                type="submit"
                aria-label="Cerca"
                className="absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{ touchAction: 'manipulation' }}
              >
                <Search className="w-5 h-5 text-gray-500" />
              </button>

              <Input
                id="tour-search"
                type="search"
                inputMode="search"
                placeholder="Cerca destinazione, tour..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (onSubmitSearch) await onSubmitSearch();
                    scrollToResults();
                  }
                }}
                className="h-12 pl-14 pr-4 text-lg bg-white/90 backdrop-blur-sm text-gray-900 border-0 focus:ring-2 focus:ring-white/20"
              />
            </form>
          </div>

          {/* Breadcrumbs */}
          <div className="flex justify-center mb-8">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <MapPin className="w-5 h-5" />
              <span className="drop-shadow text-white">Destinazioni Uniche</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Users className="w-5 h-5" />
              <span className="drop-shadow text-white">Piccoli Gruppi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Star className="w-5 h-5" />
              <span className="drop-shadow text-white">Coach Esperti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default ToursHero;
