'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface TourStickyNavProps {
  price?: number;
  onScrollToSection: (sectionId: string) => void;
  tour?: {
    title: string;
    duration: number;
    image?: { url: string; alternativeText?: string };
    sessions?: any[];
  };
}

const TourStickyNav: React.FC<TourStickyNavProps> = ({ price: fallbackPrice, onScrollToSection, tour }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper: estrai prezzo dalla sessione
  const extractPrice = (session: any): number | null => {
    if (!session) return null;
    if (typeof session.price === 'number') return session.price;
    if (typeof session.price === 'string' && !isNaN(Number(session.price))) return Number(session.price);
    if (session.pricing?.from && typeof session.pricing.from === 'number') return session.pricing.from;
    const amt = session.pricePerPerson?.amount;
    if (amt && (typeof amt === 'number' || (typeof amt === 'string' && !isNaN(Number(amt))))) {
      return Number(amt);
    }
    return null;
  };

  const formatPrice = (amount: number | null | undefined) =>
    amount == null
      ? '—'
      : new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);

  // Prossima sessione (o fallback)
  const nextSessionData = useMemo(() => {
    const now = new Date();
    const sessions = tour?.sessions;
    if (!sessions || sessions.length === 0) return { session: null, price: null };
    const future = sessions
      .filter((s: any) => s?.start && new Date(s.start) >= now)
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const chosen = future[0] || sessions[0];
    return { session: chosen, price: extractPrice(chosen) };
  }, [tour]);

  const displayPrice = nextSessionData.price != null ? nextSessionData.price : fallbackPrice;

  return (
    <div
      className={`fixed left-0 right-0 z-50 flex h-[60px] w-full items-center justify-between border-b bg-background/80 px-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ease-out ${
        isVisible ? 'top-0' : '-top-20'
      }`}
    >
      {/* Left section */}
      <div className="flex items-center gap-2">
        {tour?.image?.url && (
          <img
            src={tour.image.url}
            alt={tour.image.alternativeText || tour.title}
            className="hidden h-11 w-11 rounded-lg object-cover sm:block"
          />
        )}
        <div className="flex w-[200px] flex-col justify-center sm:w-[120px]">
          <div className="h-4 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extrabold capitalize">
            {tour?.title || 'Tour'}
          </div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            {tour?.duration || 7} giorni
          </div>
        </div>
      </div>

      {/* Center section - Navigation buttons */}
      <div className="hidden items-center gap-1 sm:flex">
        <Button variant="ghost" size="sm" onClick={() => onScrollToSection('gallery')} className="text-xs font-semibold">
          Galleria
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onScrollToSection('itinerary')} className="text-xs font-semibold">
          Itinerario
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onScrollToSection('coach')} className="text-xs font-semibold">
          Coach
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onScrollToSection('sessions')} className="text-xs font-semibold">
          Partenze
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onScrollToSection('details')} className="text-xs font-semibold">
          Dettagli
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onScrollToSection('faq')} className="text-xs font-semibold">
          FAQ
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="text-xs text-muted-foreground">Da</div>
          <div className="text-sm font-bold text-foreground">{formatPrice(displayPrice)}</div>
        </div>
        <Button
          onClick={() => onScrollToSection('sessions')}
          className="px-4 py-3 sm:min-w-fit sm:px-2 sm:py-3.5 sm:text-xs"
        >
          Prenota
        </Button>
      </div>
    </div>
  );
};

export default TourStickyNav;
