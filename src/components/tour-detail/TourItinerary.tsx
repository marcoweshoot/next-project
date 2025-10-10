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
  id: string | number; // ID univoco da Strapi
  day: number | string; // Può essere un numero singolo o una stringa come "6-7-8-9-10"
  title: string;
  description: string;
  steps?: DayStep[];
  activities?: string[];
  accommodation?: string;
  meals?: string[];
  isGrouped?: boolean; // Indica se è un giorno accorpato
  groupSize?: number; // Numero di giorni nel gruppo
  originalDays?: ItineraryDay[]; // Giorni originali prima dell'accorpamento
}

interface TourItineraryProps {
  itinerary: ItineraryDay[];
  tour?: any;
}

// Funzione per accorpare i giorni consecutivi con lo stesso titolo
const groupConsecutiveDays = (days: ItineraryDay[]): ItineraryDay[] => {
  if (!days || days.length === 0) return [];
  
  const grouped: ItineraryDay[] = [];
  let currentGroup: ItineraryDay[] = [];
  
  for (let i = 0; i < days.length; i++) {
    const currentDay = days[i];
    
    // Se è il primo giorno o il titolo è diverso dal precedente
    if (i === 0 || currentDay.title !== days[i - 1].title) {
      // Se c'è un gruppo precedente, aggiungilo ai risultati
      if (currentGroup.length > 0) {
        grouped.push(createGroupedDay(currentGroup));
      }
      // Inizia un nuovo gruppo
      currentGroup = [currentDay];
    } else {
      // Il titolo è uguale, aggiungi al gruppo corrente
      currentGroup.push(currentDay);
    }
  }
  
  // Aggiungi l'ultimo gruppo se esiste
  if (currentGroup.length > 0) {
    grouped.push(createGroupedDay(currentGroup));
  }
  
  return grouped;
};

// Funzione per creare un giorno accorpato
const createGroupedDay = (group: ItineraryDay[]): ItineraryDay => {
  const firstDay = group[0];
  // I dati originali da Strapi hanno 'number', non 'day'
  const dayNumbers = group.map(day => (day as any).number || day.day).sort((a, b) => Number(a) - Number(b));
  
  return {
    ...firstDay,
    id: `grouped-${firstDay.id}`, // ID univoco per il gruppo
    day: dayNumbers.join('-'), // "6-7-8-9-10"
    isGrouped: true,
    groupSize: group.length,
    originalDays: group
  };
};

const TourItinerary: React.FC<TourItineraryProps> = ({ itinerary, tour }) => {
  if (!itinerary || itinerary.length === 0) return null;

  // Accorpa i giorni consecutivi con lo stesso titolo
  const groupedItinerary = groupConsecutiveDays(itinerary);

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
          {groupedItinerary.map((day) => (
            <TourDay
              key={day.id}
              day={{
                id: `day-${day.day}`,
                number: day.day,
                title: day.title,
                description: day.description,
                steps: day.steps,
                isGrouped: day.isGrouped,
                groupSize: day.groupSize,
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
