'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getTourLink } from '@/components/tour-card/tourCardUtils';
import { FALLBACKS } from '@/constants/fallbacks';
import type { Tour } from '@/types/tour';

interface LastMinuteTourCardProps {
  tour: Tour;
}

const LastMinuteTourCard: React.FC<LastMinuteTourCardProps> = ({ tour }) => {
  const tourLink = getTourLink({
    slug: tour.slug,
    states: tour.states,
    places: tour.places,
  });

  const imageUrl = tour.cover?.url || FALLBACKS.LAST_MINUTE_IMAGE;
  const altText = tour.cover?.alt || tour.title;

  const renderStatusBadge = () => {
    const badgeMap: Record<string, { text: string; color: string }> = {
      confirmed: { text: 'Confermato', color: 'bg-green-100 text-green-800' },
      soldOut: { text: 'Tutto esaurito', color: 'bg-red-100 text-red-800' },
      waitingList: { text: "Lista d'attesa", color: 'bg-gray-200 text-gray-800' },
      almostConfirmed: { text: 'Quasi confermato', color: 'bg-blue-100 text-blue-800' },
    };

    if (tour.status && badgeMap[tour.status]) {
      const { text, color } = badgeMap[tour.status];
      return (
        <span className={`text-sm py-1.5 px-3 rounded-md font-semibold ${color}`}>
          {text}
        </span>
      );
    }

    const spots = tour.availableSpots;
    if (spots > 0) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-sm py-1.5 px-3 rounded-md font-semibold">
          Solo {spots} {spots === 1 ? 'posto' : 'posti'} disponibili!
        </span>
      );
    }

    return (
      <span className="bg-red-100 text-red-800 text-sm py-1.5 px-3 rounded-md font-semibold">
        Tutto esaurito
      </span>
    );
  };

  return (
    <Link
      href={tourLink}
      aria-label={`Vai al tour: ${tour.title}`}
      className="block group"
    >
      <Card className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1.5 bg-white flex flex-col h-full">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-2xl"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <CardContent className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-3 line-clamp-2 min-h-[3.6rem]">
            {tour.title}
          </h3>

          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <div>
              <p>Partenza: {tour.startDate}</p>
              <p>Durata: {tour.duration}</p>
            </div>
            <div className="text-right text-lg font-bold text-gray-900">
              €{tour.price.toLocaleString()}
            </div>
          </div>

          <div className="mt-auto">{renderStatusBadge()}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LastMinuteTourCard;
