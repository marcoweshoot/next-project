
import Link from "next/link";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getTourLink } from '@/components/tour-card/tourCardUtils';

interface LastMinuteTour {
  id: string;
  title: string;
  slug: string;
  image: string;
  startDate: string;
  duration: string;
  price: number;
  availableSpots: number;
  status?: string;
  states?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  places?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface LastMinuteTourCardProps {
  tour: LastMinuteTour;
}

const LastMinuteTourCard: React.FC<{
  children?: React.ReactNode;
}> = ({
  tour,
  children
}) => {
  const tourLink = getTourLink({
    slug: tour.slug,
    states: tour.states,
    places: tour.places
  });

  const renderStatusBadge = () => {
    // Priorità allo status del tour se presente
    switch (tour.status) {
      case 'confirmed':
        return (
          <div className="bg-green-100 text-green-800 text-center text-sm py-2 px-3 rounded-md font-medium">
            Confermato
          </div>
        );
      case 'soldOut':
        return (
          <div className="bg-red-100 text-red-800 text-center text-sm py-2 px-3 rounded-md font-medium">
            Tutto esaurito
          </div>
        );
      case 'waitingList':
        return (
          <div className="bg-gray-200 text-gray-800 text-center text-sm py-2 px-3 rounded-md font-medium">
            Lista d'attesa
          </div>
        );
      case 'almostConfirmed':
        return (
          <div className="bg-blue-100 text-blue-800 text-center text-sm py-2 px-3 rounded-md font-medium">
            Quasi confermato
          </div>
        );
      case 'almostFull':
      case 'scheduled':
      default:
        // Se non c'è uno status specifico, mostra i posti disponibili
        const spots = tour.availableSpots;
        if (spots > 0) {
          const postText = spots === 1 ? 'posto disponibile!' : 'posti disponibili!';
          return (
            <div className="bg-yellow-100 text-yellow-800 text-center text-sm py-2 px-3 rounded-md font-medium">
              Solo {spots} {postText}
            </div>
          );
        } else {
          return (
            <div className="bg-red-100 text-red-800 text-center text-sm py-2 px-3 rounded-md font-medium">
              Tutto esaurito
            </div>
          );
        }
    }
  };

  return (
    <Link 
      href={tourLink}
      className="group"
    >
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>
        
        <CardContent className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight h-14 overflow-hidden line-clamp-2">
            {tour.title}
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <div>Partenza: {tour.startDate}</div>
              <div>Durata: {tour.duration}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">€{tour.price.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="mt-auto">
            {renderStatusBadge()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LastMinuteTourCard;
