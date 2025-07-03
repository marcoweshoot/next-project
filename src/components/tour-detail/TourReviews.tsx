"use client"

'use client';

import React, { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ReviewCard from '@/components/ReviewCard';
import { Star, Quote } from 'lucide-react';
import TourReviewsModal from './TourReviewsModal';

interface TourReviewsProps {
  reviews: Array<{
    id: string;
    title: string;
    description: string;
    rating: number;
    user: {
      firstName: string;
      profilePicture?: {
        url: string;
        alternativeText?: string;
      };
    };
    created_at: string;
  }>;
}

const TourReviews: React.FC<TourReviewsProps> = ({ reviews }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Calcola la media delle recensioni
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Quote className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Le esperienze dei nostri viaggiatori
            </h2>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600">
              ({reviews.length} recensioni)
            </span>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Scopri cosa pensano i fotografi che hanno già vissuto questa esperienza unica
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <ReviewCard review={review} />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {reviews.length > 3 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
                <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
              </>
            )}
          </Carousel>
        </div>

        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button 
              className="text-neutral-900 font-semibold hover:underline"
              onClick={() => setIsModalOpen(true)}
            >
              Vedi tutte le recensioni
            </button>
          </div>
        )}
        
        <TourReviewsModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          reviews={reviews}
          title="Recensioni del viaggio"
        />
      </div>
    </section>
  );
};

export default TourReviews;
