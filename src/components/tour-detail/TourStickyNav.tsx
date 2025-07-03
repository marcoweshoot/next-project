"use client"

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TourStickyNavProps {
  price: number;
  onScrollToSection: (sectionId: string) => void;
  tour?: {
    title: string;
    duration: number;
    image?: {
      url: string;
      alternativeText?: string;
    };
  };
}

const TourStickyNav: React.FC<TourStickyNavProps> = ({ price, onScrollToSection, tour }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the navbar when user scrolls down past 200px
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onScrollToSection('gallery')}
          className="text-xs font-semibold"
        >
          Galleria
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onScrollToSection('itinerary')}
          className="text-xs font-semibold"
        >
          Itinerario
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onScrollToSection('coach')}
          className="text-xs font-semibold"
        >
          Coach
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onScrollToSection('sessions')}
          className="text-xs font-semibold"
        >
          Partenze
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-600">Da</div>
          <div className="text-sm font-bold">€{price?.toLocaleString()}</div>
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
