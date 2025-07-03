"use client"

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import GalleryLightbox from './gallery/GalleryLightbox';
import TourDayHeader from './day/TourDayHeader';
import TourDayContent from './day/TourDayContent';
import TourDaySteps from './day/TourDaySteps';
import TourDayInfoCards from './day/TourDayInfoCards';

interface DayStep {
  id: string;
  title: string;
  description: string;
  locations?: DayLocation[];
}

interface DayLocation {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
}

interface DayProps {
  id: string;
  number: number;
  title: string;
  description?: string;
  steps?: DayStep[];
  locations?: DayLocation[];
  activities?: string[];
  accommodation?: string;
  meals?: string[];
}

interface TourDayProps {
  day: DayProps;
  tour?: any;
}

const TourDay: React.FC<TourDayProps> = ({ day, tour }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{url: string; alternativeText?: string; caption?: string}>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log(`TourDay: Rendering day ${day.number}:`, day);
  console.log(`TourDay: Day ${day.number} steps:`, day.steps);

  const openLightbox = (pictures: Array<{id: string; title: string; url: string; alternativeText: string;}>, startIndex = 0) => {
    const images = pictures.map(pic => ({
      url: pic.url,
      alternativeText: pic.alternativeText,
      caption: pic.title
    }));
    setLightboxImages(images);
    setCurrentImageIndex(startIndex);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500">
        <TourDayHeader number={day.number} title={day.title} />

        <div className="p-8">
          <TourDayContent description={day.description} />
          
          <TourDaySteps steps={day.steps || []} onOpenLightbox={openLightbox} />
          
          <TourDayInfoCards 
            accommodation={day.accommodation}
            meals={day.meals}
            activities={day.activities}
          />
        </div>
      </div>

      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={currentImageIndex}
        onNext={nextImage}
        onPrev={prevImage}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};

export default TourDay;
