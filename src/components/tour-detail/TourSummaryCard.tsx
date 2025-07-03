'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import TourPricingHeader from './TourPricingHeader';
import TourDetailsGrid from './TourDetailsGrid';
import TourInclusionsSection from './TourInclusionsSection';

interface TourSummaryCardProps {
  tour: {
    duration: number;
    price: number;
    deposit?: number;
    maxParticipants: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    sessions?: Array<{
      start: string;
      end: string;
      price: number;
      deposit?: number;
      maxPax: number;
    }>;
    includes?: Array<{
      title: string;
      description?: string;
      icon?: {
        url: string;
        alternativeText?: string;
      };
    }>;
    excludes?: Array<{
      title: string;
      description?: string;
      icon?: {
        url: string;
        alternativeText?: string;
      };
    }>;
  };
  onViewSessions: () => void;
  onOpenWhatsApp: () => void;
}

const TourSummaryCard: React.FC<TourSummaryCardProps> = ({ 
  tour, 
  onViewSessions, 
  onOpenWhatsApp 
}) => {
  // Get the next upcoming session
  const getNextSession = () => {
    if (!tour.sessions || tour.sessions.length === 0) return null;
    
    const now = new Date();
    const futureSessions = tour.sessions
      .filter(session => new Date(session.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    return futureSessions[0] || null;
  };

  const nextSession = getNextSession();
  const hasAvailableSessions = nextSession !== null;

  return (
    <Card className="sticky top-32 shadow-lg border-0">
      <CardContent className="p-0">
        <TourPricingHeader 
          price={tour.price}
          deposit={tour.deposit}
          nextSession={nextSession}
          hasAvailableSessions={hasAvailableSessions}
        />

        <TourDetailsGrid 
          duration={tour.duration}
          maxParticipants={tour.maxParticipants}
          difficulty={tour.difficulty}
        />

        <TourInclusionsSection 
          includes={tour.includes}
          excludes={tour.excludes}
        />

        {/* Action buttons */}
        <div className="p-6 space-y-3">
          <Button 
            onClick={onViewSessions}
            className="w-full font-bold py-3"
            style={{ backgroundColor: '#E25141', color: 'white' }}
            size="lg"
          >
            Vedi Partenze
          </Button>
          <Button 
            variant="outline" 
            onClick={onOpenWhatsApp}
            className="w-full border-2 hover:bg-gray-50"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chatta con noi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourSummaryCard;
