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

// ✅ Sezione Last Minute tema-aware
const LastMinuteSection: React.FC<Props> = ({ tours, daysAhead = 60 }) => {
  const lastMinuteTours = getLastMinuteTours(tours, daysAhead);

  if (!Array.isArray(lastMinuteTours) || lastMinuteTours.length === 0) return null;

  return (
    <section className="py-16 bg-muted" aria-label="Offerte Last Minute">
      <div className="container">
        <LastMinuteSectionHeader />
        <LastMinuteToursGrid tours={lastMinuteTours} />

        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background font-semibold px-8 py-4 rounded-full shadow-md transition"
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

export default LastMinuteSection;
