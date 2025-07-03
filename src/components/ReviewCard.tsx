
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: {
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
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={review.user.profilePicture?.url || ''} 
                alt={review.user.firstName}
              />
              <AvatarFallback className="bg-primary text-white">
                {review.user.firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.user.firstName}
              </h4>
              <p className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            {renderStars(review.rating)}
          </div>
        </div>
        
        <div className="space-y-3">
          {review.title && (
            <h5 className="font-medium text-gray-900 line-clamp-2">
              {review.title}
            </h5>
          )}
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateDescription(review.description)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
