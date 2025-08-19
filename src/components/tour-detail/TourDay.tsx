'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import GalleryLightbox from './gallery/GalleryLightbox';
import TourDayHeader from './day/TourDayHeader';
import TourDayContent from './day/TourDayContent';
import TourDaySteps from './day/TourDaySteps';

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

interface LightboxImage {
  url: string;
  alternativeText?: string;
  caption?: string;
}

interface TourDayProps {
  day: DayProps;
  tour?: any;
}

const TourDay: React.FC<TourDayProps> = ({ day, tour }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log(`TourDay: Rendering day ${day.number}:`, day);
  console.log(`TourDay: Day ${day.number} steps:`, day.steps);

  const openLightbox = (
    pictures: Array<{ id?: string; title?: string; url?: string; alternativeText?: string }>,
    startIndex = 0
  ) => {
    const images: LightboxImage[] = pictures
      .filter((pic) => pic?.url && typeof pic.url === 'string')
      .map((pic) => ({
        url: pic.url!,
        alternativeText: pic.alternativeText || '',
        caption: pic.title || '',
      }));

    if (images.length === 0) {
      console.warn('openLightbox chiamato con immagini non valide:', pictures);
      return;
    }

    setLightboxImages(images);
    setCurrentImageIndex(startIndex >= 0 && startIndex < images.length ? startIndex : 0);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    if (lightboxImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    if (lightboxImages.length === 0) return;
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
