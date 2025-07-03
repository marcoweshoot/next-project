
import Link from "next/link";
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Users, ArrowRight } from 'lucide-react';

interface TourSession {
  id: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'confirmed' | 'almostConfirmed' | 'almostFull' | 'waitingList' | 'soldOut';
  price: number;
  currency: string;
  availableSpots?: number;
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    difficulty?: string;
    experience_level?: string;
    coach: {
      id: string;
      name: string;
      avatar?: {
        url: string;
        alt?: string;
      };
    };
  };
}

interface CalendarSessionProps {
  session: TourSession;
  isLast: boolean;
}

const CalendarSession: React.FC<{
  children?: React.ReactNode;
}> = ({
  session,
  isLast,
  children
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase(),
      fullDate: date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      })
    };
  };

  const getStatusBadge = (status: string, availableSpots?: number) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" />confermato</Badge>;
      case 'almostFull':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" />quasi pieno</Badge>;
      case 'waitingList':
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1"><Users className="w-3 h-3" />lista d'attesa</Badge>;
      case 'soldOut':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">tutto pieno</Badge>;
      default:
        return availableSpots && availableSpots > 0 ? 
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><Users className="w-3 h-3" />Iscrizioni aperte</Badge> : 
          <Badge className="bg-gray-100 text-gray-800">A quasi pieno</Badge>;
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Intermedio';
      case 'hard':
        return 'Difficile';
      default:
        return 'Intermedio';
    }
  };

  const getExperienceLabel = (experience?: string) => {
    switch (experience?.toLowerCase()) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzato';
      case 'expert':
        return 'Esperto';
      default:
        return 'Tutti i livelli';
    }
  };

  const startDateInfo = formatDate(session.startDate);
  const endDateInfo = formatDate(session.endDate);
  const getCurrency = (currency: string) => currency === 'EUR' ? '€' : currency;

  // Check if this is a future session
  const now = new Date();
  const sessionDate = new Date(session.startDate);
  const isFutureSession = sessionDate > now;

  return (
    <div 
      className={`flex flex-col md:flex-row md:items-center p-4 md:p-6 ${!isLast ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
    >
      {/* Date Range - Mobile Optimized */}
      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
        {/* Desktop/Tablet Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-3">
            {/* Start Date */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{startDateInfo.day}</div>
              <div className="text-xs font-medium text-gray-600">{startDateInfo.month}</div>
            </div>
            
            {/* Duration Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight className="w-4 h-4 text-red-600 mb-1" />
              <div className="text-xs font-medium text-red-600 whitespace-nowrap">
                {session.tour.duration} giorni
              </div>
            </div>
            
            {/* End Date */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{endDateInfo.day}</div>
              <div className="text-xs font-medium text-gray-600">{endDateInfo.month}</div>
            </div>
          </div>
          
          {/* Tour Info - Difficulty and Experience */}
          <div className="text-center mt-2 text-sm text-gray-500">
            {getDifficultyLabel(session.tour.difficulty)} • {getExperienceLabel(session.tour.experience_level)}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{startDateInfo.day}</div>
                <div className="text-xs font-medium text-gray-600">{startDateInfo.month}</div>
              </div>
              
              <ArrowRight className="w-3 h-3 text-red-600" />
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{endDateInfo.day}</div>
                <div className="text-xs font-medium text-gray-600">{endDateInfo.month}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-medium text-red-600">{session.tour.duration} giorni</div>
            </div>
          </div>
          
          <div className="text-center mt-1 text-xs text-gray-500">
            {getDifficultyLabel(session.tour.difficulty)} • {getExperienceLabel(session.tour.experience_level)}
          </div>
        </div>
      </div>
      {/* Tour Info */}
      <div className="flex-1 min-w-0 mb-4 md:mb-0">
        <h3 className="text-lg md:text-xl font-bold text-red-600 mb-2 hover:text-red-700 transition-colors">
          <Link href={`/viaggi-fotografici/destinazioni/italia/italia/${session.tour.slug}`}>
            {session.tour.title}
          </Link>
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-2">
            <img
              src={session.tour.coach.avatar?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32'}
              alt={session.tour.coach.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>{session.tour.coach.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(session.status, session.availableSpots)}
        </div>
      </div>
      {/* Price and Action */}
      <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start md:text-right md:ml-6">
        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-0 md:mb-2">
          {isFutureSession ? (
            session.price > 0 ? (
              <>{getCurrency(session.currency)}{session.price.toLocaleString()}</>
            ) : (
              <>Scopri</>
            )
          ) : (
            <span className="text-lg md:text-xl text-orange-600 font-semibold">Coming Soon</span>
          )}
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 text-sm md:text-base">
          <Link href={`/viaggi-fotografici/destinazioni/italia/italia/${session.tour.slug}`}>
            SCOPRI VIAGGIO
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CalendarSession;
