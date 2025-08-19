'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface TourStickyNavProps {
  price?: number;
  onScrollToSection: (sectionId: string) => void;
  tour?: {
    title: string;
    duration: number;
    image?: {
      url: string;
      alternativeText?: string;
    };
    sessions?: any[];
  };
}

const TourStickyNav: React.FC<TourStickyNavProps> = ({ price: fallbackPrice, onScrollToSection, tour }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper: estrai prezzo dalla sessione (con alcuni path comuni)
  const extractPrice = (session: any): number | null => {
    if (!session) return null;
    if (typeof session.price === 'number') return session.price;
    if (typeof session.price === 'string' && !isNaN(Number(session.price))) return Number(session.price);
    if (session.pricing?.from && typeof session.pricing.from === 'number') return session.pricing.from;
    if (
      session.pricePerPerson?.amount &&
      (typeof session.pricePerPerson.amount === 'number' ||
        (typeof session.pricePerPerson.amount === 'string' && !isNaN(Number(session.pricePerPerson.amount))))
    ) {
      return Number(session.pricePerPerson.amount);
    }
    return null;
  };

  const formatPrice = (amount: number | null | undefined) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calcolo della prossima sessione (futura) o fallback alla prima
  const nextSessionData = useMemo(() => {
    const now = new Date();
    const sessions = tour?.sessions;
    if (!sessions || sessions.length === 0) return { session: null, price: null };
    const future = sessions
      .filter((s: any) => s?.start && new Date(s.start) >= now)
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const chosen = future[0] || sessions[0];
    const extractedPrice = extractPrice(chosen);
    return { session: chosen, price: extractedPrice };
  }, [tour]);

  const displayPrice = nextSessionData.price != null ? nextSessionData.price : fallbackPrice;

  return (
    <div
      className={`fixed w-full h-[60px] left-0 right-0 bg-white z-50 flex items-center justify-between px-2 shadow-lg transition-all duration-200 ease-out ${
        isVisible ? 'top-0' : '-top-20'
      }`}
    >
      {/* Left section */}
      <div className="flex items-center gap-2">
        {tour?.image?.url && (
          <img
            src={tour.image.url}
            alt={tour.image.alternativeText || tour.title}
            className="w-11 h-11 rounded-lg object-cover hidden sm:block"
          />
        )}
        <div className="flex flex-col justify-center w-[200px] sm:w-[120px]">
          <div className="text-xs font-extrabold h-4 overflow-hidden text-ellipsis whitespace-nowrap capitalize">
            {tour?.title || 'Tour'}
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase">
            {tour?.duration || 7} giorni
          </div>
        </div>
      </div>

      {/* Center section - Navigation buttons */}
      <div className="hidden sm:flex items-center gap-1">
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
          <div className="text-xs text-gray-600">Da</div>
          <div className="text-sm font-bold">{formatPrice(displayPrice)}</div>
        </div>
        <Button
          onClick={() => onScrollToSection('sessions')}
          className="px-4 py-3 sm:px-2 sm:py-3.5 sm:text-xs sm:min-w-fit"
        >
          Prenota
        </Button>
      </div>
    </div>
  );
};

export default TourStickyNav;
