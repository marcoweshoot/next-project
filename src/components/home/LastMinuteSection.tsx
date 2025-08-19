import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LastMinuteSectionHeader from './last-minute/LastMinuteSectionHeader';
import LastMinuteToursGrid from './last-minute/LastMinuteToursGrid';
import { getLastMinuteTours } from './last-minute/getLastMinuteTours';
import type { Tour } from '@/types/tour';

interface Session {
  id: string;
  start: string;
  end: string;
  price: number;
  maxPax: number;
  status?: string;
  users?: Array<{
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: {
      url: string;
      alternativeText?: string;
    };
  }>;
}

interface Props {
  tours: Tour[];
  daysAhead?: number;
}

// ✅ Questa è la definizione che ti mancava!
const LastMinuteSection: React.FC<Props> = ({ tours, daysAhead = 60 }) => {
  const lastMinuteTours = getLastMinuteTours(tours, daysAhead);

  if (!Array.isArray(lastMinuteTours) || lastMinuteTours.length === 0) return null;

  return (
    <section className="py-16 bg-red-50" aria-label="Offerte Last Minute">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LastMinuteSectionHeader />
        <LastMinuteToursGrid tours={lastMinuteTours} />

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-red-600 text-white font-semibold px-8 py-4 rounded-full shadow-md transition"
            asChild
          >
            <Link href="/viaggi-fotografici/calendario" aria-label="Vai alla pagina calendario viaggi">
              Vedi Tutti i Viaggi
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// ✅ Default export corretta
export default LastMinuteSection;
