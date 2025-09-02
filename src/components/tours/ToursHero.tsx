'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  onSubmitSearch?: () => Promise<void> | void;
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

  // Debounce per input
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debounceRef = useRef<NodeJS.Timeout>();

  const scrollToResults = useCallback(() => {
    const el =
      resultsRef?.current ??
      (resultsId ? (document.getElementById(resultsId) as HTMLElement | null) : null);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (resultsOffsetPx ?? 0);
    window.scrollTo({ top, behavior: 'smooth' });
  }, [resultsRef, resultsId, resultsOffsetPx]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onSubmitSearch) await onSubmitSearch();
      requestAnimationFrame(scrollToResults);
    },
    [onSubmitSearch, scrollToResults]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearchTerm(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange(value), 150);
    },
    [onSearchChange]
  );

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        onSearchChange(localSearchTerm);
        if (onSubmitSearch) await onSubmitSearch();
        scrollToResults();
      }
    },
    [onSubmitSearch, scrollToResults, localSearchTerm, onSearchChange]
  );

  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);
  useEffect(() => setLocalSearchTerm(searchTerm), [searchTerm]);

  return (
    <section
      // 3 righe: [spazio elastico] [CONTENUTO CENTRALE] [spazio elastico]
      className="relative min-h-[88svh] md:min-h-[92svh] grid grid-rows-[1fr_auto_1fr] overflow-hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Tours Hero"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={
            heroImage?.url ??
            'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif'
          }
          className="w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Riga centrale: TITOLO + TESTO + SEARCH + BREADCRUMBS + QUICK STATS */}
      <div className="relative z-20 row-start-2 w-full">
        <div className="container mx-auto px-4 text-center flex flex-col items-center gap-6 md:gap-8">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg text-white">
            Viaggi Fotografici
          </h1>

          <p className="text-lg md:text-2xl max-w-3xl mx-auto opacity-90 drop-shadow-md text-white">
            Esplora il mondo attraverso l&apos;obiettivo della tua fotocamera. Destinazioni
            mozzafiato, coach esperti e piccoli gruppi per un&apos;esperienza unica.
          </p>

          {/* Search Field */}
          <div className="w-full max-w-lg">
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
                value={localSearchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-12 pl-14 pr-4 text-lg bg-white/90 backdrop-blur-sm text-gray-900 border-0 focus:ring-2 focus:ring-white/20"
              />
            </form>
          </div>

          {/* Breadcrumbs */}
          <div className="flex justify-center">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl w-full">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <MapPin className="w-5 h-5 text-white" />
              <span className="drop-shadow text-white">Destinazioni Uniche</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Users className="w-5 h-5 text-white" />
              <span className="drop-shadow text-white">Piccoli Gruppi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Star className="w-5 h-5 text-white" />
              <span className="drop-shadow text-white">Coach Esperti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator centrato + cliccabile */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={scrollToResults}
          aria-label="Scorri per vedere i risultati"
          className="flex flex-col items-center"
        >
          <span className="text-[10px] tracking-wide uppercase text-white/90">Scorri</span>
          <div className="mt-1 w-6 h-10 border-2 border-white rounded-full flex justify-center items-start">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default ToursHero;
