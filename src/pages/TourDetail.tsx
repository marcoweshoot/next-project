
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import SocialProofSection from '@/components/SocialProofSection';
import { useTourDetail } from '@/hooks/useTourDetail';
import { scrollToSection } from '@/utils/tourDetailUtils';
import TourDetailLoading from '@/components/tour-detail/TourDetailLoading';
import TourDetailError from '@/components/tour-detail/TourDetailError';
import TourDetailHeader from '@/components/tour-detail/TourDetailHeader';
import TourDetailContent from '@/components/tour-detail/TourDetailContent';
import { Star } from 'lucide-react';

const TourDetail = () => {
  const { tour, loading, error, stateSlug, placeSlug, tourSlug } = useTourDetail();

  if (loading) {
    return <TourDetailLoading />;
  }

  if (error || !tour) {
    return <TourDetailError error={error} />;
  }

  // Calculate average rating and reviews count
  const reviews = tour.reviews || [];
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount 
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.round(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  return (
    <>
      <SEO 
        title={`${tour.title} - Viaggio Fotografico WeShoot`}
        description={tour.description || `Scopri il viaggio fotografico ${tour.title} con WeShoot`}
        url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}/${tourSlug}`}
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <div>
          <TourDetailHeader
            tour={tour}
            reviewsCount={reviewsCount}
            averageRating={averageRating}
            stateSlug={stateSlug}
            placeSlug={placeSlug}
            onScrollToSessions={() => scrollToSection('sessions')}
            onScrollToReviews={() => scrollToSection('reviews')}
            renderStars={renderStars}
          />

          <SocialProofSection />

          <TourDetailContent tour={tour} />
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default TourDetail;
