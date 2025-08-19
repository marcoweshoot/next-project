'use client';

import TourDetailHeader from './TourDetailHeader';

type Props = {
  tour: any;
  reviewsCount: number;
  averageRating: number;
  stateSlug?: string;
  placeSlug?: string;
};

export default function TourDetailHeaderClient({
  tour,
  reviewsCount,
  averageRating,
  stateSlug,
  placeSlug,
}: Props) {
  // Funzioni definite localmente per evitare passaggio dal server
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <TourDetailHeader
      tour={tour}
      reviewsCount={reviewsCount}
      averageRating={averageRating}
      stateSlug={stateSlug}
      placeSlug={placeSlug}
      onScrollToSessions={() => scrollToSection('sessions')}
      onScrollToReviews={() => scrollToSection('reviews')}
    />
  );
}
