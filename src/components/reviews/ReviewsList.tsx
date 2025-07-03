"use client"

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  description: string;
  user: { 
    firstName: string; 
    profilePicture?: { url: string; alternativeText?: string } | null;
  };
  tour?: { title: string; slug: string } | null;
  created_at: string;
}

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleReview = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review: Review) => {
        const isExpanded = expandedReviews.has(review.id);
        const shouldShowButton = review.description.length > 150;
        
        return (
          <Card key={review.id} className="h-full hover:shadow-lg transition-shadow duration-300 border-gray-200">
            <CardContent className="p-6">
              {/* User Info and Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  {review.user?.profilePicture?.url && (
                    <AvatarImage 
                      src={review.user.profilePicture.url} 
                      alt={review.user.profilePicture.alternativeText || review.user?.firstName || 'Utente'}
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg">
                    {review.user?.firstName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {review.user?.firstName || 'Utente'}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating || 5)}
                  </div>
                </div>
              </div>

              {/* Tour Info */}
              {review.tour && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {review.tour.title}
                  </p>
                </div>
              )}

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {isExpanded ? review.description : truncateText(review.description)}
              </p>

              {/* Date and Read More */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{review.created_at ? formatDate(review.created_at) : 'Luglio 2024'}</span>
                {shouldShowButton && (
                  <button 
                    onClick={() => toggleReview(review.id)}
                    className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    {isExpanded ? 'Mostra meno' : 'Leggi tutto'}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReviewsList;
