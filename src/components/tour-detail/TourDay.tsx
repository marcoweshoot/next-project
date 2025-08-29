// src/components/tour-detail/TourDay.tsx
'use client';

import React, { useMemo, useState } from 'react';
import GalleryLightbox from './gallery/GalleryLightbox';
import TourDayHeader from './day/TourDayHeader';
import TourDayContent from './day/TourDayContent';
import TourDaySteps from './day/TourDaySteps';

interface DayLocation {
  id: string | number;
  title: string;
  slug?: string;
  description?: string;
  pictures?: Array<{
    id?: string | number;
    title?: string;
    url?: string;
    alternativeText?: string;
    image?: any;
  }>;
  steps?: Array<{ id?: string | number | null; title?: string | null }>;
}

interface DayStep {
  id?: string | number | null;
  title: string;
  description?: string;
  locations?: DayLocation[];
}

interface DayProps {
  id: string | number;
  number: number;
  title: string;
  description?: string;
  steps?: DayStep[];
}

interface LightboxImage {
  url: string;
  alternativeText?: string;
  caption?: string;
}

interface TourDayProps {
  day: DayProps;
  tour?: {
    locations?: DayLocation[];
  };
}

/** Match location ↔︎ step: per ID, altrimenti per titolo (case-insensitive) */
function locationsForStep(all: DayLocation[] = [], step: DayStep): DayLocation[] {
  if (!all.length || !step) return [];
  const stepId = step.id != null ? String(step.id) : null;
  const stepTitle = (step.title || '').trim().toLowerCase();

  const byId = stepId
    ? all.filter((loc) =>
        Array.isArray(loc.steps) &&
        loc.steps.some((s) => s?.id != null && String(s.id) === stepId)
      )
    : [];

  if (byId.length) return byId;

  const byTitle = all.filter((loc) =>
    Array.isArray(loc.steps) &&
    loc.steps.some(
      (s) => (s?.title || '').trim().toLowerCase() === stepTitle
    )
  );

  return byTitle;
}

const TourDay: React.FC<TourDayProps> = ({ day, tour }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 🔗 Collega ad ogni step SOLO le location pertinenti
  const stepsWithLocations = useMemo(() => {
    const allLocations = tour?.locations || [];
    const steps = day.steps || [];
    return steps.map((s) => ({
      ...s,
      locations: locationsForStep(allLocations, s).map((location) => ({
        ...location,
        pictures:
          location.pictures?.map((pic) => ({
            id: String(pic.id || ''),
            title: pic.title || '',
            url: pic.url || '',
            alternativeText: pic.alternativeText || '',
          })) || [],
      })),
    }));
  }, [day.steps, tour?.locations]);

  const openLightbox = (
    pictures: Array<{ id?: string; title?: string; url?: string; alternativeText?: string }>,
    startIndex = 0
  ) => {
    const images: LightboxImage[] = (pictures || [])
      .filter((p) => p?.url && typeof p.url === 'string')
      .map((p) => ({
        url: p.url!,
        alternativeText: p.alternativeText || '',
        caption: p.title || '',
      }));

    if (!images.length) return;

    setLightboxImages(images);
    setCurrentImageIndex(startIndex >= 0 && startIndex < images.length ? startIndex : 0);
    setLightboxOpen(true);
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) =>
      lightboxImages.length ? (prev + 1) % lightboxImages.length : 0
    );
  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      lightboxImages.length ? (prev - 1 + lightboxImages.length) % lightboxImages.length : 0
    );
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500">
        <TourDayHeader number={day.number} title={day.title} />

        <div className="p-8">
          <TourDayContent description={day.description} />

          {/* ✅ passiamo gli step “arricchiti” con le loro location */}
          <TourDaySteps steps={stepsWithLocations} onOpenLightbox={openLightbox} />
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
