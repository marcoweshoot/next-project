'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import TourPricingHeader from './TourPricingHeader';
import TourInclusionsSection from './TourInclusionsSection';

interface TourSummaryCardProps {
  tour: {
    difficulty?: 'easy' | 'medium' | 'hard';
    sessions?: Array<{
      start: string;
      end: string;
      price: number;
      deposit?: number;
      maxPax: number;
    }>;
    whats_includeds?: Array<{
      title: string;
      description?: string;
      icon?: {
        url: string;
        alternativeText?: string;
      };
    }>;
    whats_not_includeds?: Array<{
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
  const now = useMemo(() => new Date(), []);

  const nextSession = useMemo(() => {
    if (!tour.sessions || tour.sessions.length === 0) return null;

    return tour.sessions
      .filter(session => new Date(session.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] || null;
  }, [tour.sessions, now]);

  const hasAvailableSessions = !!nextSession;

  return (
    <Card className="sticky top-32 shadow-lg border-0">
      <CardContent className="p-0">
        <TourPricingHeader
          price={nextSession?.price}
          deposit={nextSession?.deposit}
          nextSession={nextSession ? {
            start: nextSession.start,
            end: nextSession.end,
            maxPax: nextSession.maxPax
          } : undefined}
          difficulty={tour.difficulty}
          hasAvailableSessions={hasAvailableSessions}
        />

        <TourInclusionsSection
          includes={tour.whats_includeds}
          excludes={tour.whats_not_includeds}
        />

        {/* Action buttons */}
        <div className="p-6 space-y-3">
          <Button
            onClick={onViewSessions}
            className="w-full font-bold py-3"
            style={{ backgroundColor: 'red-600', color: 'white' }}
            size="lg"
            aria-label="Scopri le prossime partenze disponibili"
          >
            Vedi Partenze
          </Button>
          <Button
            variant="outline"
            onClick={onOpenWhatsApp}
            className="w-full border-2 hover:bg-gray-50"
            size="lg"
            aria-label="Contattaci su WhatsApp"
          >
            <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            Chatta con noi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourSummaryCard;
