'use client';

import TourStickyNav from './TourStickyNav';
import TourGallery from './TourGallery';
import TourDescription from './TourDescription';
import TourItinerary from './TourItinerary';
import TourEquipment from './TourEquipment';
import TourThingsToKnow from './TourThingsToKnow';
import TourCoach from './TourCoach';
import TourSessions from './TourSessions';
import TourReviews from './TourReviews';
import TourFAQ from './TourFAQ';
import GroupGallerySection from '@/components/tour-detail/GroupGallerySection';

interface Coach {
  id?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: {
    url?: string;
    alternativeText?: string;
  };
}

interface TourDetailContentProps {
  tour: any;
  coaches: Coach[];
  isFallbackPast?: boolean;
}

export default function TourDetailContentClient({
  tour,
  coaches,
  isFallbackPast = false,
}: TourDetailContentProps) {
  if (!tour) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  const openWhatsApp = (tourData: any) => {
    const phone = '+393508828541';
    const message = `Ciao! Vorrei avere informazioni sul tour: ${tourData?.title || ''}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const galleryData = Array.isArray(tour.gallery || tour.pictures)
    ? (tour.gallery || tour.pictures)
    : [];

  const priceFromSession =
    Array.isArray(tour.sessions) && tour.sessions.length > 0
      ? tour.sessions[0]?.price
      : undefined;

  return (
    <>
      <TourStickyNav
        price={tour.price || priceFromSession || 0}
        tour={tour}
        onScrollToSection={scrollToSection}
      />

      <TourGallery gallery={galleryData} />

      <TourDescription
        tour={tour}
        onViewSessions={() => scrollToSection('sessions')}
        onOpenWhatsApp={() => openWhatsApp(tour)}
      />

      <TourItinerary itinerary={Array.isArray(tour.days) ? tour.days : []} tour={tour} />


      <section id="details" className="py-16 bg-background border-t border-border transition-colors">
        <div className="container mx-auto px-4">
          <TourEquipment
            thingsNeeded={tour.things_needed}
            experienceLevel={tour.experience_level}
          />
        </div>
      </section>

      <TourThingsToKnow
        difficulty={tour.difficulty}
        things2know={tour.things2know}
      />

      <TourCoach
        coaches={Array.isArray(coaches) ? coaches : []}
        isFallbackPast={isFallbackPast}
      />

      <TourSessions
        tour={tour}
        coach={
          Array.isArray(coaches) && coaches[0]
            ? {
                id: coaches[0].id || 'default',
                name:
                  `${coaches[0].firstName || ''} ${coaches[0].lastName || 'Coach'}`.trim() ||
                  'Coach',
                avatar: coaches[0].profilePicture?.url
                  ? {
                      url: coaches[0].profilePicture.url,
                      alt: coaches[0].profilePicture.alternativeText || 'Coach',
                    }
                  : undefined,
              }
            : undefined
        }
      />

      <GroupGallerySection gallery={galleryData} />

      {Array.isArray(tour.reviews) && tour.reviews.length > 0 && (
        <TourReviews reviews={tour.reviews} />
      )}

      <section id="faq" className="py-16 bg-background border-t border-border transition-colors">
        <div className="container mx-auto px-4">
          <TourFAQ faqs={Array.isArray(tour.faqs) ? tour.faqs : []} />
        </div>
      </section>
    </>
  );
}
