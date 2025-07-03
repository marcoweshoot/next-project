'use client';

import Link from "next/link";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';

interface SessionCardProps {
  session: {
    id: string;
    startDate: string;
    endDate: string;
    status: 'scheduled' | 'confirmed' | 'almostConfirmed' | 'almostFull' | 'waitingList' | 'soldOut';
    price: number;
    currency: string;
    availableSpots?: number;
  };
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    coach: {
      id: string;
      name: string;
      avatar?: {
        url: string;
        alt?: string;
      };
    };
  };
  directBooking?: boolean;
  showTitle?: boolean;
}

const SessionCard: React.FC<{
  children?: React.ReactNode;
}> = ({
  session,
  tour,
  directBooking = false,
  showTitle = false,
  children
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusBadge = (status: string, availableSpots?: number) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confermato</Badge>;
      case 'almostFull':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Quasi pieno</Badge>;
      case 'waitingList':
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1"><Users className="w-3 h-3" />Lista d'attesa</Badge>;
      case 'soldOut':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">Tutto pieno</Badge>;
      default:
        return availableSpots && availableSpots > 0 ? 
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><Users className="w-3 h-3" />Max {availableSpots} posti</Badge> : 
          <Badge className="bg-gray-100 text-gray-800">Iscrizioni aperte</Badge>;
    }
  };

  const getCurrency = (currency: string) => currency === 'EUR' ? '€' : currency;

  // Check if this is a future session
  const now = new Date();
  const sessionDate = new Date(session.startDate);
  const isFutureSession = sessionDate > now;

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Ciao! Sono interessato al viaggio "${tour.title}" in partenza il ${formatDate(session.startDate)}. Potresti darmi maggiori informazioni?`);
    window.open(`https://wa.me/393495269093?text=${message}`, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {showTitle && (
          <h3 className="text-lg font-bold text-gray-900 mb-4">{tour.title}</h3>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left side: Date and Duration */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {formatDateShort(session.startDate)} - {formatDateShort(session.endDate)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{tour.duration} giorni</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <img
                src={tour.coach.avatar?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'}
                alt={tour.coach.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm">{tour.coach.name}</span>
            </div>

            {getStatusBadge(session.status, session.availableSpots)}
          </div>

          {/* Right side: Price and Actions */}
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-gray-900 mb-4">
              {isFutureSession ? (
                session.price > 0 ? (
                  <>{getCurrency(session.currency)}{session.price.toLocaleString()}</>
                ) : (
                  <>Scopri</>
                )
              ) : (
                <span className="text-lg text-orange-600 font-semibold">Coming Soon</span>
              )}
            </div>
            
            <div className="space-y-2">
              {directBooking ? (
                <>
                  <Button 
                    onClick={openWhatsApp}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Prenota Ora
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/viaggi-fotografici/destinazioni/italia/italia/${tour.slug}`}>
                      Vedi Dettagli
                    </Link>
                  </Button>
                </>
              ) : (
                <Button className="w-full text-white" asChild>
                  <Link href={`/viaggi-fotografici/destinazioni/italia/italia/${tour.slug}`}>
                    Vedi Viaggio
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
