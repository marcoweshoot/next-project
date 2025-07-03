
import React from 'react';
import TourStickyNav from './TourStickyNav';
import TourGallery from './TourGallery';
import TourDescription from './TourDescription';
import TourItinerary from './TourItinerary';
import TourEquipment from './TourEquipment';
import TourThingsToKnow from './TourThingsToKnow';
import TourReviews from './TourReviews';
import TourCoach from './TourCoach';
import TourSessions from './TourSessions';
import TourFAQ from './TourFAQ';
import { scrollToSection, openWhatsApp, createDefaultCoach } from '@/utils/tourDetailUtils';

interface TourDetailContentProps {
  tour: any;
}

const TourDetailContent: React.FC<TourDetailContentProps> = ({ tour }) => {
  // Create default coach for TourSessions component (legacy compatibility)
  const defaultCoach = createDefaultCoach(tour.coaches);

  return (
    <>
      <TourStickyNav 
        price={tour.price}
        tour={tour}
        onScrollToSection={scrollToSection}
      />

      <TourGallery gallery={tour.gallery} />

      <TourDescription 
        tour={tour}
        onViewSessions={() => scrollToSection('sessions')}
        onOpenWhatsApp={() => openWhatsApp(tour)}
      />

      <TourItinerary itinerary={tour.itinerary} />

      <TourEquipment 
        thingsNeeded={tour.thingsNeeded}
        experienceLevel={tour.experienceLevel}
      />

      <TourThingsToKnow 
        experienceLevel={tour.experienceLevel}
        difficulty={tour.difficulty}
        thingsToKnow={tour.thingsToKnow}
      />

      <div id="reviews">
        <TourReviews reviews={tour.reviews} />
      </div>

      <TourCoach coaches={tour.coaches} />

      <TourSessions tour={tour} coach={defaultCoach} />

      <TourFAQ faqs={tour.faqs} />
    </>
  );
};

export default TourDetailContent;
