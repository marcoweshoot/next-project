import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';
import {
  getFutureSessions,
  calculateTourDuration,
  normalizeDifficulty,
  transformTours,
} from '@/utils/TourDataUtilis';

interface CollectionDetailToursProps {
  tours: any[]; // ricevi i dati da GraphQL o normalizzati, quindi `any[]` è accettabile
}

const CollectionDetailTours: React.FC<CollectionDetailToursProps> = ({ tours }) => {
  if (!tours || tours.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Viaggi di questa Collezione
          </h2>
          <p className="text-muted-foreground">
            Non ci sono viaggi disponibili per questa collezione al momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Viaggi di questa Collezione
          </h2>
          <p className="text-xl text-muted-foreground">
            Scopri tutti i viaggi fotografici disponibili
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="animate-zoomIn">
              <TourCard tour={transformTours([tour])[0]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionDetailTours;
