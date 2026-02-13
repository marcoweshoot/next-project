'use client';
import React, { useState, useRef, useEffect } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if content is taller than 4 lines (approximately 6rem with line-height)
    if (contentRef.current) {
      const lineHeight = 1.75; // leading-relaxed = 1.75
      const fontSize = 16; // text-base = 16px
      const maxHeight = lineHeight * fontSize * 4; // 4 lines
      
      setShowButton(contentRef.current.scrollHeight > maxHeight);
    }
  }, [tour.description]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Descrizione del Viaggio
            </h2>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {tour.description && (
                <div className="relative">
                  <div
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: tour.description }}
                    className={`text-base leading-relaxed text-muted-foreground transition-all duration-300 ${
                      !isExpanded ? 'line-clamp-4' : ''
                    }`}
                  />
                  {showButton && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-3 text-primary hover:text-primary/80 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      {isExpanded ? 'Mostra meno' : 'Mostra di più'}
                    </button>
                  )}
                </div>
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
