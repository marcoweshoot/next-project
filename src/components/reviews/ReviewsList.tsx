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
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        aria-hidden="true"
        className={
          i < rating
            ? 'h-4 w-4 text-yellow-400 fill-yellow-400'
            : 'h-4 w-4 text-muted-foreground fill-transparent'
        }
      />
    ));

  const MAX_LENGTH = 250;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => {
        const isLong = review.description.length > MAX_LENGTH;
        const truncated = isLong
          ? review.description.slice(0, MAX_LENGTH) + '...'
          : review.description;

        return (
          <Card
            key={review.id}
            className="border bg-card text-card-foreground transition-shadow duration-300 hover:shadow-lg"
          >
            <CardContent className="p-6">
              {/* User Info */}
              <div className="mb-4 flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  {review.user?.profilePicture?.url && (
                    <AvatarImage
                      src={review.user.profilePicture.url}
                      alt={
                        review.user.profilePicture.alternativeText ||
                        review.user?.firstName ||
                        'Utente'
                      }
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                    {review.user?.firstName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {review.user?.firstName || 'Utente'}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating || 5)}
                  </div>
                </div>
              </div>

              {/* Tour info */}
              {review.tour && (
                <div className="mb-4 rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {review.tour.title}
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {truncated}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(review.created_at)}</span>
                {isLong && (
                  <Link
                    href={`/recensioni/${review.id}`}
                    className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded"
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
