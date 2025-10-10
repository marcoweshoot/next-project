// src/components/tour-detail/TourDay.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Clock, Camera, MapPin } from 'lucide-react';
import GalleryLightbox from './gallery/GalleryLightbox';
import TourDayHeader from './day/TourDayHeader';
import TourDayContent from './day/TourDayContent';
import TourDaySteps from './day/TourDaySteps';
import TourDayLocation from './day/TourDayLocation';

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
  number: number | string; // Può essere un numero singolo o una stringa come "6-7-8-9-10"
  title: string;
  description?: string;
  steps?: DayStep[];
  isGrouped?: boolean; // Indica se è un giorno accorpato
  groupSize?: number; // Numero di giorni nel gruppo
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
        {/* Barra colorata in alto */}
        <div aria-hidden="true" className="h-[3px] bg-gradient-to-r from-primary via-rose-500 to-amber-400" />
        
        {/* Contenuto unificato */}
        <div className="p-6 md:p-8">
          {/* Sezione giorno e titolo */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-300 mb-3">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>
                {typeof day.number === 'string' && day.number.includes('-') 
                  ? `Giorni ${day.number}` 
                  : `Giorno ${day.number}`}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {day.title}
            </h2>
          </div>

          {/* Separatore */}
          <div className="border-b border-border mb-6" />

          {/* Sezione programma fotografico */}
          {stepsWithLocations && stepsWithLocations.length > 0 && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-foreground mb-4">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Programma fotografico del giorno
              </div>

              {stepsWithLocations.map((step, index) => {
                const stepKey = `${step.id ?? step.title}-${index}`;
                
                return (
                  <article key={stepKey} className="space-y-4">
                    {/* Titolo del programma */}
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>

                    {/* Descrizione del programma */}
                    {step.description && (
                      <div
                        className="prose prose-lg text-gray-800 dark:text-gray-200 max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: step.description }}
                      />
                    )}

                    {/* Location fotografiche */}
                    {step.locations && step.locations.length > 0 && (
                      <section className="mt-6">
                        <div className="mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                          <h4 className="text-base font-semibold text-foreground">
                            Location fotografiche
                          </h4>
                          <div className="ml-2 h-px flex-1 bg-border" aria-hidden="true" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {step.locations.map((location, li) => {
                            const locKey = `${location.id ?? location.title}-${li}`;
                            return (
                              <TourDayLocation
                                key={locKey}
                                location={{
                                  ...location,
                                  id: String(location.id || location.title || `location-${li}`),
                                  slug: location.slug || String(location.title || '').toLowerCase().replace(/\s+/g, '-'),
                                }}
                                onOpenLightbox={openLightbox}
                                headingLevel={5}
                              />
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </article>
                );
              })}
            </div>
          )}
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
