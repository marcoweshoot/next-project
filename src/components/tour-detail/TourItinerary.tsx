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
  day: number;
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
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  return (
    <section id="itinerary" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Il tuo viaggio giorno per giorno
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Scopri ogni momento magico di questo incredibile viaggio fotografico. 
            Ogni giorno è pensato per offrirti le migliori opportunità di scatto e momenti indimenticabili.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {itinerary.map((day) => (
            <TourDay 
              key={day.day}
              day={{
                id: `day-${day.day}`,
                number: day.day,
                title: day.title,
                description: day.description,
                steps: day.steps,
                activities: day.activities,
                accommodation: day.accommodation,
                meals: day.meals
              }}
              tour={tour}
            />
          ))}
        </div>

        {/* Call to action finale */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto a vivere questa avventura fotografica? 📸
            </h3>
            <p className="text-xl mb-6 text-white/90">
              Non vediamo l'ora di condividere con te questi momenti incredibili
            </p>
            <button 
              onClick={() => {
                const sessionsElement = document.getElementById('sessions');
                if (sessionsElement) {
                  sessionsElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg"
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
