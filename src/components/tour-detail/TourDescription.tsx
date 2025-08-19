'use client';
import React from 'react';
import TourSummaryCard from './TourSummaryCard';
import TourHighlights from './TourHighlights';

interface TourDescriptionProps {
  tour: {
    title: string;
    description?: string;
    duration: number;
    price: number;
    deposit?: number;
    maxParticipants: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    highlights?: Array<{
      id: string;
      title: string;
      description: string;
      icon?: {
        url: string;
        alternativeText?: string;
      };
    }>;
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

const TourDescription: React.FC<TourDescriptionProps> = ({ tour, onViewSessions, onOpenWhatsApp }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Descrizione del Viaggio
            </h2>
            <div className="prose prose-lg max-w-none">
              {tour.description && (
                <div 
                  dangerouslySetInnerHTML={{ __html: tour.description }}
                  className="text-base leading-relaxed text-gray-700"
                />
              )}
            </div>

            {/* Highlights Section */}
            {tour.highlights && tour.highlights.length > 0 && (
              <TourHighlights highlights={tour.highlights} />
            )}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <TourSummaryCard 
              tour={tour}
              onViewSessions={onViewSessions}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourDescription;
