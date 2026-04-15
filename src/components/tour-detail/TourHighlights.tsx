'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { getFullMediaUrl } from '@/utils/TourDataUtilis'; // ok
const defaultIcon = '/icons/default-icon.png';

function slugify(input: string | number | undefined | null) {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'item';
}

interface HighlightItem {
  id?: string | number | null;
  title?: string;
  description?: string;
  icon?: {
    url?: string | null;
    alternativeText?: string | null;
  } | null;
}

interface TourHighlightsProps {
  highlights: HighlightItem[];
}

const HighlightCard = React.memo(({ highlight }: { highlight: HighlightItem }) => {
  const remote = highlight?.icon?.url ? getFullMediaUrl(highlight.icon.url) : '';
  const iconSrc = remote && remote.trim().length > 0 ? remote : defaultIcon;
  const iconAlt =
    (highlight?.icon?.alternativeText || highlight?.title || 'Icona').toString();

  return (
    <Card className="h-full bg-card text-card-foreground border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={iconSrc}
              alt={iconAlt}
              width={40}
              height={40}
              className="object-contain w-10 h-10"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-foreground mb-1">
              {highlight.title || 'Senza titolo'}
            </h4>
            {highlight.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
HighlightCard.displayName = 'HighlightCard';

const TourHighlights: React.FC<TourHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="tour-highlights-title">
      <h3
        id="tour-highlights-title"
        className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center"
      >
        Punti Salienti del Viaggio
      </h3>

      {/* Mobile: horizontal swipe carousel */}
      <div className="sm:hidden">
        <div className="flex items-stretch overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 -mx-4 px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {highlights.map((h, i) => {
            const safeKey = `${slugify(h?.id ?? h?.title)}-${i}`;
            return (
              <div key={safeKey} className="snap-start shrink-0 w-[75%]">
                <HighlightCard highlight={h} />
              </div>
            );
          })}
        </div>
        {highlights.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="text-xs text-muted-foreground">scorri per vedere tutti</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        )}
      </div>

      {/* Tablet + Desktop: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((h, i) => {
          const safeKey = `${slugify(h?.id ?? h?.title)}-${i}`;
          return <HighlightCard key={safeKey} highlight={h} />;
        })}
      </div>
    </section>
  );
};

export default TourHighlights;
