'use client';

import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import TourDayLocation from './TourDayLocation';

function slugify(input: string | number | undefined | null) {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'item';
}

interface DayLocation {
  id?: string | number | null;
  title: string;
  slug?: string;
  description?: string;
  pictures?: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
}

interface DayStep {
  id?: string | number | null;
  title: string;
  description?: string;
  locations?: DayLocation[];
}

interface TourDayStepsProps {
  steps: DayStep[];
  onOpenLightbox: (
    pictures: Array<{ id: string; title: string; url: string; alternativeText: string }>,
    startIndex?: number
  ) => void;
  /** livello base dell’intestazione per lo step (default: 3 => h3) */
  baseLevel?: 2 | 3 | 4 | 5 | 6;
  /** ✅ nuovo: usa queste location se lo step non ne ha */
  fallbackLocations?: DayLocation[];
}

const TourDaySteps: React.FC<TourDayStepsProps> = ({
  steps,
  onOpenLightbox,
  baseLevel = 3,
  fallbackLocations = [],
}) => {
  if (!steps || steps.length === 0) return null;

  const H = (`h${baseLevel}` as keyof JSX.IntrinsicElements);
  const Hsub = (`h${Math.min(6, baseLevel + 1)}` as keyof JSX.IntrinsicElements);

  return (
    <section className="space-y-6">
      {steps.map((step, index) => {
        const stepKey = `${slugify(step.id ?? step.title)}-${index}`;
        const headingId = `step-title-${stepKey}`;

        // ✅ se lo step non ha locations, mostriamo le tour.locations
        const locationsToShow =
          (step.locations && step.locations.length > 0) ? step.locations : (fallbackLocations || []);

        return (
          <article
            key={stepKey}
            className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_6px_22px_rgba(0,0,0,0.06)] p-6 md:p-8"
            aria-labelledby={headingId}
          >
            {/* Accento sinistro decorativo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary to-orange-400"
            />

            {/* Chip in testa alla card */}
            <div className="mb-3">
              {index === 0 ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-foreground">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Programma fotografico del giorno
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-border">
                  Step {index + 1}
                </span>
              )}
            </div>

            {/* Titolo dello step */}
            {React.createElement(
              H,
              { id: headingId, className: 'text-2xl font-semibold tracking-tight text-foreground' },
              step.title
            )}

            {step.description && (
              <div
                className="prose max-w-none text-muted-foreground mt-3 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: step.description }}
              />
            )}

            {locationsToShow.length > 0 && (
              <section className="mt-6" aria-labelledby={`loc-title-${stepKey}`}>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                  {React.createElement(
                    Hsub,
                    { id: `loc-title-${stepKey}`, className: 'text-base font-semibold text-foreground' },
                    'Location fotografiche'
                  )}
                  <div className="ml-2 h-px flex-1 bg-border" aria-hidden="true" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {locationsToShow.map((location, li) => {
                    const locKey = `${slugify(location.id ?? location.title)}-${li}`;
                    return (
                      <TourDayLocation
                        key={locKey}
                        location={{
                          ...location,
                          id: String(location.id || location.title || `location-${li}`),
                          slug: location.slug || slugify(location.title),
                        }}
                        onOpenLightbox={onOpenLightbox}
                        headingLevel={Math.min(6, baseLevel + 2) as 3 | 4 | 5 | 6}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </article>
        );
      })}
    </section>
  );
};

export default TourDaySteps;
