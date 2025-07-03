"use client";

import React from 'react';
import PageHeader from '@/components/PageHeader';

interface CalendarHeroProps {
  coverImage: string;
}

const CalendarHero: React.FC<CalendarHeroProps> = ({ coverImage }) => {
  return (
    <PageHeader backgroundImage={coverImage}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Tutte le date dei viaggi fotografici
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          Pulisci le lenti, carica le batterie, svuota le schede e preparati a riempirle di emozioni.
        </p>
      </div>
    </PageHeader>
  );
};

export default CalendarHero;
