'use client';

import Link from "next/link";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MessageCircle } from 'lucide-react';

interface SessionCardProps {
  session: {
    id: string;
    start: string;
    end: string;
    status: string;
    price: number;
    currency: string;
    maxPax: number;
    users?: Array<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: {
        id: string;
        url: string;
        alternativeText?: string;
      };
    }>;
  };
  tour: {
    id: string;
    title: string;
    slug: string;
  };
  coach: {
    id: string;
    name: string;
    avatar?: {
      url: string;
      alt?: string;
    };
  };
  isNext?: boolean;
}

const SessionCard: React.FC<{
  children?: React.ReactNode;
}> = ({
  session,
  tour,
  coach,
  isNext = false,
  children
}) => {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const month = startDate.toLocaleDateString('it-IT', { month: 'long' });
    const year = startDate.getFullYear();
    
    return {
      dateRange: `${startDay} - ${endDay} ${month}`,
      year: year.toString()
    };
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAvailableSpots = () => {
    if (session.status === 'soldOut') return 0;
    if (session.status === 'waitingList') return 0;
    return session.maxPax || 7; // Default to 7 spots
  };

  const openWhatsApp = () => {
    const { dateRange } = formatDateRange(session.start, session.end);
    const message = encodeURIComponent(`Ciao! Sono interessato al viaggio "${tour.title}" in partenza il ${dateRange}. Potresti darmi maggiori informazioni?`);
    window.open(`https://wa.me/393495269093?text=${message}`, '_blank');
  };

  const availableSpots = getAvailableSpots();
  const duration = getDuration(session.start, session.end);
  const price = session.price || 0;
  const { dateRange, year } = formatDateRange(session.start, session.end);

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-0 shadow-md ${isNext ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}>
      <CardContent className="p-0">
        {isNext && (
          <div className="bg-orange-500 text-white text-center py-2 px-4">
            <span className="text-sm font-medium">Prossima partenza</span>
          </div>
        )}
        
        <div className="p-4 md:p-6">
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            {/* Date Header - More prominent on mobile */}
            <div className="text-center border-b border-gray-100 pb-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {dateRange}
              </div>
              <div className="text-sm text-gray-500">{year}</div>
            </div>

            {/* Duration and Spots */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{duration} giorni</span>
              </div>
              
              <Badge 
                className={`flex items-center gap-1 ${
                  availableSpots <= 3 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <Users className="w-3 h-3" />
                {availableSpots > 0 ? `${availableSpots} posti` : 'Tutto pieno'}
              </Badge>
            </div>

            {/* Coach */}
            <div className="flex items-center gap-3">
              <img
                src={coach.avatar?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40'}
                alt={coach.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-sm text-gray-700 font-medium">{coach.name}</span>
            </div>

            {/* Price and Actions */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  €{price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">per persona</div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={openWhatsApp}
                  className="w-full font-medium py-3"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Prenota Ora
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-gray-200 hover:bg-gray-50 text-gray-700" 
                  asChild
                >
                  <Link href={`/viaggi-fotografici/destinazioni/italia/italia/${tour.slug}`}>
                    Vedi Dettagli
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-start md:justify-between md:gap-6">
            <div className="flex-1">
              {/* Date Range */}
              <div className="flex items-center gap-2 text-gray-900 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {dateRange} {year}
                </span>
              </div>
              
              {/* Duration */}
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{duration} giorni</span>
              </div>

              {/* Coach */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={coach.avatar?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40'}
                  alt={coach.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-700">{coach.name}</span>
              </div>

              {/* Available Spots Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  className={`flex items-center gap-1 ${
                    availableSpots <= 3 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {availableSpots > 0 ? `${availableSpots} posti` : 'Tutto pieno'}
                </Badge>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-gray-900 mb-4">
                €{price.toLocaleString()}
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={openWhatsApp}
                  className="w-full font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Prenota Ora
                </Button>
                <Button variant="outline" className="w-full text-sm" asChild>
                  <Link href={`/viaggi-fotografici/destinazioni/italia/italia/${tour.slug}`}>
                    Vedi Dettagli
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
