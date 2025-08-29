'use client';

import React from 'react';
import TourDay from './TourDay';

interface DayStep {
  id: string;
  title: string;
  description: string;
  locations?: any[];
}

interface ItineraryDay {
  number: number;
  title: string;
  description: string;
  steps?: DayStep[];
  activities?: string[];
  accommodation?: string;
  meals?: string[];
}

interface TourItineraryProps {
  itinerary: ItineraryDay[];
  tour?: any;
}

const TourItinerary: React.FC<TourItineraryProps> = ({ itinerary, tour }) => {
  if (!itinerary || itinerary.length === 0) return null;

  const handleScrollToSessions = () => {
    const sessionsElement = document.getElementById('sessions');
    if (sessionsElement) {
      sessionsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="itinerary"
      aria-label="Itinerario giornaliero del tour"
      className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-muted dark:to-background"
    >
      <div className="container mx-auto px-4">
        {/* Intestazione */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-6">
            Il tuo viaggio fotografico giorno per giorno
          </h2>
          <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Scopri ogni momento magico di questo incredibile viaggio fotografico. Ogni giorno è pensato per offrirti le migliori opportunità di scatto e momenti indimenticabili.
          </p>
        </div>

        {/* Giorni del viaggio */}
        <div className="max-w-6xl mx-auto space-y-8">
          {itinerary.map((day) => (
            <TourDay
              key={day.number}
              day={{
                id: `day-${day.number}`,
                number: day.number,
                title: day.title,
                description: day.description,
                steps: day.steps,
              }}
              tour={tour}
            />
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="bg-primary text-white dark:text-primary-foreground rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto a vivere questa avventura fotografica? 📸
            </h3>
            <p className="text-xl mb-6 text-white/90 dark:text-primary-foreground/90">
              Non vediamo l'ora di condividere con te questi momenti incredibili.
            </p>
            <button
              id="cta-scroll-sessions"
              aria-label="Scorri alle partenze disponibili"
              onClick={handleScrollToSessions}
              className="bg-white text-primary dark:bg-primary-foreground dark:text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-100 dark:hover:bg-primary-foreground/90 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Scopri le partenze disponibili
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourItinerary;
