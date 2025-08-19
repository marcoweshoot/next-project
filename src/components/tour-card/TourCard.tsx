import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

import { Tour } from '@/types';
import { FALLBACKS } from '@/constants/fallbacks';
import { getDifficultyBadge } from './tourCardUtils';
import TourCardCoaches from './TourCardCoaches';
import { formatDateRange } from '@/utils/TourDataUtilis';
import TourCardPricing from './TourCardPricing';

interface Props {
  tour: Tour;
}

const TourCard: React.FC<Props> = ({ tour }) => {
  const {
    title,
    startDate,
    duration,
    price,
    difficulty = 'medium',
    cover,
    slug,
    destination,
    sessions = [],
  } = tour;

  const coverUrl = cover?.url?.trim() || FALLBACKS.TOUR_COVER;
  const coverAlt = cover?.alt || title;
  const difficultyBadge = getDifficultyBadge(difficulty);

  // === URL: gestisci sia array che oggetto singolo per states/places ===
  const pick = (v?: string) =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;

  const rawState = (tour as any)?.states;
  const rawPlace = (tour as any)?.places;

  const stateSlug =
    pick(Array.isArray(rawState) ? rawState?.[0]?.slug : rawState?.slug) ||
    pick(destination?.country) ||
    'stato';

  const placeSlug =
    pick(Array.isArray(rawPlace) ? rawPlace?.[0]?.slug : rawPlace?.slug) ||
    pick(destination?.slug) ||
    'luogo';

  const href = `/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}/${slug}`;

  // 🔍 Filtra e ordina le sessioni future per ottenere la prossima sessione
  const now = new Date().toISOString();
  const futureSessions = sessions.filter((session) => session.start > now);
  const sortedFuture = futureSessions.sort((a, b) =>
    a.start.localeCompare(b.start)
  );
  const nextSession = sortedFuture[0];

  // ☂️ Fallback coach
  let coachesToShow = nextSession?.users || [];
  if (!coachesToShow.length) {
    const sortedAll = sessions
      .filter((s) => s.start)
      .sort((a, b) => b.start.localeCompare(a.start));
    const lastSession = sortedAll[0];
    const lastUsers = lastSession?.users || [];
    if (lastUsers.length) {
      coachesToShow = [lastUsers[lastUsers.length - 1]];
    }
  }

  const hasFutureSessions = futureSessions.length > 0;

  return (
    <Link
      href={href}
      className="flex flex-col bg-white rounded-3xl shadow-md overflow-hidden transition hover:shadow-lg cursor-pointer"
    >
      {/* Cover */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
        <Image
          src={coverUrl}
          alt={coverAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${difficultyBadge.className}`}
          >
            {difficultyBadge.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-[calc(100%-12rem)] sm:h-[calc(100%-14rem)] md:h-[calc(100%-16rem)]">
        {/* Titolo */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        {/* Data */}
        <div className="flex items-center gap-2 text-gray-500 text-sm sm:text-base mt-2">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formatDateRange(startDate, duration)}</span>
        </div>

        {/* Coach */}
        <div className="mt-4">
          <TourCardCoaches sessionCoaches={coachesToShow} />
        </div>

        {/* Pricing e call-to-action */}
        <TourCardPricing
          duration={duration}
          hasFutureSessions={hasFutureSessions}
          price={price}
          href={href}
        />
      </div>
    </Link>
  );
};

export default TourCard;
