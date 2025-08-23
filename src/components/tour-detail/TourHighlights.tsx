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
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            <h4 className="text-base font-semibold text-gray-900 mb-1">
              {highlight.title || 'Senza titolo'}
            </h4>
            {highlight.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{highlight.description}</p>
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
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center"
      >
        Punti Salienti del Viaggio
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((h, i) => {
          const safeKey = `${slugify(h?.id ?? h?.title)}-${i}`;
          return <HighlightCard key={safeKey} highlight={h} />;
        })}
      </div>
    </section>
  );
};

export default TourHighlights;
