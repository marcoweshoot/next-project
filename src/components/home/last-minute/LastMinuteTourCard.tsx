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

  const formatPrice = (val?: number) =>
    val == null
      ? '—'
      : new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
        }).format(val);

  const renderStatusBadge = () => {
    const base = 'text-sm py-1.5 px-3 rounded-md font-semibold';
    const map: Record<string, { text: string; cls: string }> = {
      confirmed:      { text: 'Confermato',       cls: 'bg-emerald-600/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300' },
      soldOut:        { text: 'Tutto esaurito',   cls: 'bg-rose-600/15    text-rose-700    dark:bg-rose-400/15    dark:text-rose-300' },
      waitingList:    { text: "Lista d'attesa",   cls: 'bg-slate-600/15   text-slate-700   dark:bg-slate-400/15   dark:text-slate-300' },
      almostConfirmed:{ text: 'Quasi confermato', cls: 'bg-sky-600/15     text-sky-700     dark:bg-sky-400/15     dark:text-sky-300' },
    };

    if (tour.status && map[tour.status]) {
      const { text, cls } = map[tour.status];
      return <span className={`${base} ${cls}`}>{text}</span>;
    }

    const spots = tour.availableSpots ?? 0;
    if (spots > 0) {
      return (
        <span className={`${base} bg-amber-600/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300`}>
          Solo {spots} {spots === 1 ? 'posto' : 'posti'} disponibili!
        </span>
      );
    }

    return (
      <span className={`${base} bg-rose-600/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300`}>
        Tutto esaurito
      </span>
    );
  };

  return (
    <Link
      href={tourLink}
      aria-label={`Vai al tour: ${tour.title}`}
      // 👇 forza il colore del link (e disabilita l’underline/visited blu)
      className="group block rounded-2xl text-foreground visited:text-foreground no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="rounded-t-2xl object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <CardContent className="flex flex-grow flex-col p-5">
          <h3 className="mb-3 min-h-[3.6rem] line-clamp-2 text-lg font-semibold leading-tight text-foreground">
            {tour.title}
          </h3>

          <div className="mb-3 flex justify-between text-sm text-muted-foreground">
            <div>
              <p>Partenza: {tour.startDate}</p>
              <p>Durata: {tour.duration}</p>
            </div>
            {/* 👇 important per evitare qualunque cascata dall'anchor */}
            <div className="text-right text-lg font-bold !text-foreground font-variant-numeric tabular-nums">
              {formatPrice(tour.price)}
            </div>
          </div>

          <div className="mt-auto">{renderStatusBadge()}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LastMinuteTourCard;
