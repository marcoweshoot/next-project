'use client';

import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import TourDayLocation from './TourDayLocation';

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

interface TourDayStepsProps {
  steps: DayStep[];
  onOpenLightbox: (
    pictures: Array<{ id: string; title: string; url: string; alternativeText: string }>,
    startIndex?: number
  ) => void;
  /** livello base dell’intestazione per lo step (default: 3 => h3) */
  baseLevel?: 2 | 3 | 4 | 5 | 6;
}

const TourDaySteps: React.FC<TourDayStepsProps> = ({ steps, onOpenLightbox, baseLevel = 3 }) => {
  if (!steps || steps.length === 0) return null;

  // heading dinamici: Step -> H, sottotitolo -> Hsub (H+1)
  const H = (`h${baseLevel}` as keyof JSX.IntrinsicElements);
  const Hsub = (`h${Math.min(6, baseLevel + 1)}` as keyof JSX.IntrinsicElements);

  return (
    <section className="space-y-6">
      {steps.map((step, index) => (
        <article
          key={step.id}
          className="relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_6px_22px_rgba(0,0,0,0.06)] p-6 md:p-8"
          aria-labelledby={`step-title-${step.id}`}
        >
          {/* Accento sinistro decorativo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary to-orange-400"
          />

          {/* Chip in testa alla card */}
          <div className="mb-3">
            {index === 0 ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-900">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Programma fotografico del giorno
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
                Step {index + 1}
              </span>
            )}
          </div>

          {/* Titolo dello step: H3 di default */}
          {React.createElement(
            H,
            { id: `step-title-${step.id}`, className: 'text-2xl font-semibold tracking-tight text-zinc-900' },
            step.title
          )}

          {step.description && (
            <div
              className="prose prose-zinc max-w-none text-zinc-700 mt-3"
              // Attenzione: se nel rich text ci sono <h1..h6> possono alterare l'ordine titoli
              // Meglio limitarli in CMS o normalizzare lato codice.
              dangerouslySetInnerHTML={{ __html: step.description }}
            />
          )}

          {step.locations?.length ? (
            <section className="mt-6" aria-labelledby={`loc-title-${step.id}`}>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                {React.createElement(
                  Hsub,
                  { id: `loc-title-${step.id}`, className: 'text-base font-semibold text-zinc-900' },
                  'Location fotografiche'
                )}
                <div className="ml-2 h-px flex-1 bg-zinc-200" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {step.locations.map((location) => (
                  <TourDayLocation
                    key={location.id}
                    location={location}
                    onOpenLightbox={onOpenLightbox}
                    headingLevel={Math.min(6, baseLevel + 2) as 3 | 4 | 5 | 6} // es: step=h3 → loc=h5
                  />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      ))}
    </section>
  );
};

export default TourDaySteps;
