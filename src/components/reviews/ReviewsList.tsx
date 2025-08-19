import Link from 'next/link';
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

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  const MAX_LENGTH = 250;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review) => {
        const isLong = review.description.length > MAX_LENGTH;
        const truncated = isLong
          ? review.description.slice(0, MAX_LENGTH) + '...'
          : review.description;

        return (
          <Card
            key={review.id}
            className="hover:shadow-lg transition-shadow duration-300 border-gray-200"
          >
            <CardContent className="p-6">
              {/* User Info */}
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

              {/* Tour info */}
              {review.tour && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {review.tour.title}
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {truncated}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(review.created_at)}</span>
                {isLong && (
                  <Link
                    href={`/recensioni/${review.id}`}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Leggi tutto
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
