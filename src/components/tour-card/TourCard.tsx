import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Tour } from "@/types";
import { FALLBACKS } from "@/constants/fallbacks";
import { getDifficultyBadge } from "./tourCardUtils";
import TourCardCoaches from "./TourCardCoaches";
import { formatDateRange } from "@/utils/TourDataUtilis"; // <-- fix import
import TourCardPricing from "./TourCardPricing";

export interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const {
    title,
    startDate,
    duration,
    price,
    difficulty = "medium",
    cover,
    slug,
    destination,
    sessions = [],
  } = tour;

  const coverUrl = cover?.url?.trim() || FALLBACKS.TOUR_COVER;
  const coverAlt = cover?.alt || title;
  const difficultyBadge = getDifficultyBadge(difficulty);

  // === URL: gestisci sia array che oggetto singolo per states/places ===
  const pick = (v?: string) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const rawState = (tour as any)?.states;
  const rawPlace = (tour as any)?.places;

  const stateSlug =
    pick(Array.isArray(rawState) ? rawState?.[0]?.slug : rawState?.slug) ||
    pick(destination?.country) ||
    "stato";

  const placeSlug =
    pick(Array.isArray(rawPlace) ? rawPlace?.[0]?.slug : rawPlace?.slug) ||
    pick(destination?.slug) ||
    "luogo";

  const href = `/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}/${slug}`;

  // 🔍 Filtra/ordina le sessioni future per ottenere la prossima
  const now = new Date().toISOString();
  const futureSessions = sessions.filter((s) => s.start > now);
  const sortedFuture = futureSessions.sort((a, b) => a.start.localeCompare(b.start));
  const nextSession = sortedFuture[0];

  // ☂️ Fallback coach
  let coachesToShow = nextSession?.users || [];
  if (!coachesToShow.length) {
    const sortedAll = sessions.filter((s) => s.start).sort((a, b) => b.start.localeCompare(a.start));
    const lastUsers = sortedAll[0]?.users || [];
    if (lastUsers.length) coachesToShow = [lastUsers[lastUsers.length - 1]];
  }

  const hasFutureSessions = futureSessions.length > 0;

  return (
    <Link
      href={href}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-md transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Cover */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64">
        <Image
          src={coverUrl}
          alt={coverAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute right-3 top-3 z-10">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-border ${difficultyBadge.className}`}
          >
            {difficultyBadge.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-12rem)] flex-col p-4 sm:h-[calc(100%-14rem)] md:h-[calc(100%-16rem)]">
        {/* Titolo */}
        <h3 className="min-h-[3.5rem] leading-snug line-clamp-2 text-lg font-semibold text-foreground sm:text-xl">
          {title}
        </h3>

        {/* Data */}
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
          <CalendarDays className="h-4 w-4 shrink-0" />
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
