import React from 'react';
import Image from 'next/image';
import { getDifficultyBadge } from './tourCardUtils';
import { FALLBACKS } from '@/constants/fallbacks';

interface TourCardImageProps {
  coverUrl?: string;
  coverAlt?: string;
  title: string;
  difficulty?: string;
}

const fallbackUrl = FALLBACKS.TOUR_COVER;

const TourCardImage: React.FC<TourCardImageProps> = ({
  coverUrl,
  coverAlt,
  title,
  difficulty = 'medium',
}) => {
  const difficultyBadge = getDifficultyBadge(difficulty);

  const trimmedUrl = coverUrl?.trim();
  const finalUrl = trimmedUrl && trimmedUrl !== '' ? trimmedUrl : fallbackUrl;
  const isExternal = finalUrl.startsWith('http');

  return (
    <div className="relative overflow-hidden h-48 flex-shrink-0">
      <Image
        src={finalUrl}
        alt={coverAlt?.trim() || title || 'Immagine del tour'}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        priority={false}
      />
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyBadge.className}`}
        >
          {difficultyBadge.text}
        </span>
      </div>
    </div>
  );
};

export default TourCardImage;
