"use client"

import Link from "next/link";
import React from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { GET_TOURS } from '@/graphql/queries';
import { useLastMinuteTours } from './last-minute/useLastMinuteTours';
import LastMinuteSectionHeader from './last-minute/LastMinuteSectionHeader';
import LastMinuteToursGrid from './last-minute/LastMinuteToursGrid';

const LastMinuteSection: React.FC<{
  children?: React.ReactNode;
}> = (
  {
    children
  }
) => {
  const { data: toursData, loading, error } = useQuery(GET_TOURS, {
    variables: { locale: 'it', limit: 50 }
  });

  console.log("LastMinuteSection - Tours data:", toursData);

  const lastMinuteTours = useLastMinuteTours(toursData?.tours);

  console.log("Last minute tours:", lastMinuteTours);

  if (loading) {
    return (
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Caricamento viaggi last minute...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || lastMinuteTours.length === 0) {
    console.error("Error loading tours or no tours available:", error);
    return null; // Non mostrare la sezione se non ci sono tour
  }

  return (
    <section className="py-16 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LastMinuteSectionHeader />
        <LastMinuteToursGrid tours={lastMinuteTours} />
        
        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white" asChild>
            <Link href="/viaggi-fotografici/calendario">
              Vedi Tutti i Viaggi
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LastMinuteSection;
