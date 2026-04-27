'use client';

import { useEffect, useState } from 'react';
import { generateEventId, trackLead } from '@/utils/facebook';
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

  const [supabaseReviews, setSupabaseReviews] = useState<any[]>([])

  // Fetcha le recensioni approvate da Supabase (realtime, non dipende dallo snapshot)
  useEffect(() => {
    if (!tour?.slug) return
    fetch(`/api/reviews?tourSlug=${encodeURIComponent(tour.slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.reviews)) setSupabaseReviews(data.reviews)
      })
      .catch(() => {}) // fallback silenzioso: se fallisce si vedono solo le CMS
  }, [tour?.slug])

  // --- Track ViewContent event with Pixel & CAPI ---
  useEffect(() => {
    if (tour && typeof window !== 'undefined' && window.fbq) {
      const eventId = generateEventId();

      // Calcola il prezzo minimo tra le sessioni future (il campo price è sulle sessioni, non sul tour)
      const now = new Date();
      const sessionPrice: number = Array.isArray(tour.sessions)
        ? (tour.sessions as any[])
            .filter((s) => s?.start && new Date(s.start) >= now && typeof s.price === 'number' && s.price > 0)
            .map((s) => s.price as number)
            .sort((a, b) => a - b)[0] ?? 0
        : 0;

      const eventData = {
        content_name: tour.title,
        content_category: 'Viaggi Fotografici',
        content_ids: [tour.id],
        content_type: 'product',
        value: sessionPrice,
        currency: 'EUR',
      };

      // 1. Track with Browser Pixel
      window.fbq('track', 'ViewContent', eventData, { eventID: eventId });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [FB PIXEL] ViewContent event sent from browser with event_id:', eventId);
      }

      // 2. Track with Conversions API (non-blocking)
      fetch('/api/track-fb-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'ViewContent',
          event_id: eventId,
          event_source_url: window.location.href,
          custom_data: eventData,
        }),
      }).catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [CAPI] Error sending ViewContent event to server:', error);
        }
      });
    }
  }, [tour]); // Esegui solo quando l'oggetto tour cambia
  // ----------------------------------------------------

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
    
    // Track Lead event before opening WhatsApp
    trackLead({
      contentName: tourData?.title || 'Tour Info Request',
      contentCategory: 'Viaggi Fotografici',
      value: 0,
    });
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const galleryData = Array.isArray(tour.gallery || tour.pictures)
    ? (tour.gallery || tour.pictures)
    : [];

  const priceFromSession =
    Array.isArray(tour.sessions) && tour.sessions.length > 0
      ? tour.sessions[0]?.price
      : undefined;

  const coachName = Array.isArray(coaches) && coaches[0]
    ? `${coaches[0].firstName || ''} ${coaches[0].lastName || 'Coach'}`.trim() || 'Coach WeShoot'
    : 'Coach WeShoot';

  return (
    <>
      <TourStickyNav
        price={tour.price || priceFromSession || 0}
        tour={tour}
        onScrollToSection={scrollToSection}
        coachName={coachName}
      />

      <TourGallery gallery={galleryData} />

      <TourDescription
        tour={tour}
        onViewSessions={() => scrollToSection('sessions')}
        onOpenWhatsApp={() => openWhatsApp(tour)}
      />

      <TourItinerary itinerary={Array.isArray(tour.days) ? tour.days : []} tour={tour} />

      <TourEquipment
        thingsNeeded={tour.things_needed}
        experienceLevel={tour.experience_level}
      />

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

      {(() => {
        const cmsReviews = Array.isArray(tour.reviews) ? tour.reviews : []
        // Deduplicazione: rimuovi dalle CMS eventuali recensioni già presenti in Supabase con stesso id
        const mergedReviews = [...cmsReviews, ...supabaseReviews]
        return mergedReviews.length > 0 ? <TourReviews reviews={mergedReviews} /> : null
      })()}

      <section id="faq" className="py-16 bg-background border-t border-border transition-colors">
        <div className="container mx-auto px-4">
          <TourFAQ faqs={Array.isArray(tour.faqs) ? tour.faqs : []} />
        </div>
      </section>
    </>
  );
}
