
import Link from "next/link";
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tour } from '@/types';
import TourCardImage from './TourCardImage';
import TourCardContent from './TourCardContent';
import { getFutureSessions, getLatestSession, getTourLink } from './tourCardUtils';

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<{
  children?: React.ReactNode;
}> = ({
  tour,
  children
}) => {
  const futureSessions = getFutureSessions(tour.sessions || []);
  const latestSession = getLatestSession(tour.sessions || []);
  const sessionCoaches = latestSession?.users || [];
  
  // Logic: show price only if there are future sessions
  const hasFutureSessions = futureSessions.length > 0;
  
  // Use future session if available, otherwise use latest session for coaches info
  const displaySession = hasFutureSessions ? futureSessions[0] : latestSession;
  const sessionPrice = displaySession?.price || tour.price || 0;
  const sessionDuration = displaySession?.start && displaySession?.end ? 
    Math.ceil((new Date(displaySession.end).getTime() - new Date(displaySession.start).getTime()) / (1000 * 60 * 60 * 24)) : 
    tour.duration;

  const tourLink = getTourLink(tour);

  return (
    <Link href={tourLink}>
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <TourCardImage 
          coverUrl={tour.cover?.url}
          coverAlt={tour.cover?.alt}
          title={tour.title}
          difficulty={tour.difficulty}
        />

        <TourCardContent 
          title={tour.title}
          sessionCoaches={sessionCoaches}
          mainCoach={tour.coach}
          duration={sessionDuration}
          hasFutureSessions={hasFutureSessions} // Show price only if there are future sessions
          price={sessionPrice}
        />
      </Card>
    </Link>
  );
};

export default TourCard;
