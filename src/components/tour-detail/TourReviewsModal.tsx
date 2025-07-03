
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ReviewCard from '@/components/ReviewCard';

interface TourReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  title?: string;
}

const TourReviewsModal: React.FC<TourReviewsModalProps> = ({ 
  open, 
  onOpenChange, 
  reviews, 
  title = "Tutte le recensioni"
}) => {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {title} {reviews.length > 0 && `(${reviews.length})`}
          </DialogTitle>
          <div className="flex justify-center items-center text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700 mr-1">{averageRating.toFixed(1)}</span> 
            <span>valutazione media</span>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4 pb-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
            {reviews.map((review) => (
              <div key={review.id}>
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TourReviewsModal;
