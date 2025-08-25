import React from "react";
import Image from "next/image";
import { getFullMediaUrl } from "@/utils/TourDataUtilis";

interface CalendarHeroProps {
  coverImage: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const CalendarHero: React.FC<CalendarHeroProps> = ({
  coverImage,
  title = <>Tutte le date dei viaggi fotografici</>,
  subtitle = <>Pulisci le lenti, carica le batterie, svuota le schede e preparati a riempirle di emozioni.</>,
}) => {
  const src = getFullMediaUrl(coverImage);

  return (
    <section className="relative w-full h-[52vh] min-h-[340px] overflow-hidden">
      {/* Immagine LCP ottimizzata */}
      <Image
        src={src}
        alt="WeShoot – Calendario viaggi fotografici"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />

      {/* Overlay per leggibilità (come nel PageHeader) */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        aria-hidden
      />

      {/* Content (stesse classi della home) */}
      <div className="absolute inset-0 flex items-center">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default CalendarHero;
