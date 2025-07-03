import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import TourCard from './TourCard';
import { Tour } from '@/types/tour';

interface FeaturedToursProps {
  tours: Tour[];
}

const FeaturedTours: React.FC<{
  children?: React.ReactNode;
}> = ({
  tours,
  children
}) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Viaggi Fotografici in Evidenza
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esplora le nostre destinazioni più popolari con i migliori coach fotografici professionali
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tours.slice(0, 6).map((tour, index) => (
            <div 
              key={tour.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/viaggi-fotografici">
              Vedi Tutti i Viaggi
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;
