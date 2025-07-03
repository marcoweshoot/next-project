
import { getNextSession, getCoachesFromSessions, processGalleryImages, processItinerary, calculateTourDuration } from '@/utils/tourDataProcessors';

export const useTourTransformation = (tourData: any) => {
  if (!tourData) return null;

  console.log("TourDetail: Raw days data:", tourData?.days);
  console.log("TourDetail: Raw pictures data:", tourData?.pictures);
  console.log("TourDetail: Pictures array length:", tourData?.pictures?.length);
  console.log("TourDetail: First picture structure:", tourData?.pictures?.[0]);
  console.log("TourDetail: Sessions data:", tourData?.sessions);
  console.log("TourDetail: Whats included data:", tourData?.whats_includeds);
  console.log("TourDetail: Whats not included data:", tourData?.whats_not_includeds);
  console.log("TourDetail: Experience level:", tourData?.experience_level);
  console.log("TourDetail: Things needed:", tourData?.things_needed);
  console.log("TourDetail: Things to know:", tourData?.things2know);
  
  // Debug per gli highlights
  console.log("TourDetail: Raw highlights data:", tourData?.highlights);
  if (tourData?.highlights) {
    tourData.highlights.forEach((highlight: any, index: number) => {
      console.log(`TourDetail: Highlight ${index + 1}:`, highlight);
    });
  }

  // Log steps within days
  if (tourData?.days) {
    tourData.days.forEach((day: any, index: number) => {
      console.log(`Day ${index + 1} (${day.title}):`, day);
      console.log(`Day ${index + 1} steps:`, day.steps);
    });
  }

  // Get the next session data
  const nextSession = getNextSession(tourData?.sessions || []);
  console.log("TourDetail: Next session:", nextSession);

  // Process gallery images BEFORE creating the tour object
  console.log("TourDetail: About to process gallery images...");
  const processedGallery = processGalleryImages(tourData.pictures);
  console.log("TourDetail: Processed gallery result:", processedGallery);
  console.log("TourDetail: Processed gallery length:", processedGallery?.length);

  // Get all coaches from all sessions
  const allCoaches = getCoachesFromSessions(tourData?.sessions || []);
  console.log("TourDetail: All coaches from sessions:", allCoaches);

  // Extract tour data from the simplified structure
  const tour = {
    id: tourData.id,
    title: tourData.title,
    slug: tourData.slug,
    description: tourData.description,
    excerpt: tourData.excerpt,
    image: tourData.image,
    states: tourData.states || [],
    places: tourData.places || [],
    collections: tourData.collections || [],
    pictures: tourData.pictures || [],
    days: tourData.days || [],
    faqs: tourData.faqs || [],
    sessions: tourData.sessions || [],
    reviews: tourData.reviews || [],
    // Process highlights without icon data from GraphQL - we'll add icons manually
    highlights: tourData.highlights || [],
    startDate: nextSession?.start || tourData.sessions?.[0]?.start || new Date().toISOString(),
    endDate: nextSession?.end || tourData.sessions?.[0]?.end || new Date().toISOString(),
    duration: calculateTourDuration(nextSession, tourData.sessions),
    // Always use next session price, or fallback to first session
    price: nextSession?.price || tourData.sessions?.[0]?.price || 0,
    deposit: nextSession?.deposit || tourData.sessions?.[0]?.deposit || 0,
    maxParticipants: nextSession?.maxPax || tourData.sessions?.[0]?.maxPax || 12,
    availableSpots: nextSession?.maxPax || tourData.sessions?.[0]?.maxPax || 12,
    difficulty: tourData.difficulty || 'medium' as const,
    // Get all coaches from all sessions
    coaches: allCoaches,
    // Process gallery images correctly
    gallery: processedGallery,
    // Process itinerary with steps from days
    itinerary: processItinerary(tourData.days),
    // Process includes and excludes from the API data with icons
    includes: tourData.whats_includeds?.map((item: any) => ({
      title: item.title,
      description: item.description,
      icon: item.icon
    })) || [],
    excludes: tourData.whats_not_includeds?.map((item: any) => ({
      title: item.title,
      description: item.description,
      icon: item.icon
    })) || [],
    // Add new fields for equipment and experience level
    experienceLevel: tourData.experience_level,
    thingsNeeded: tourData.things_needed,
    // Add things to know from Strapi
    thingsToKnow: tourData.things2know || []
  };

  console.log("TourDetail: Final processed gallery:", tour?.gallery);
  console.log("TourDetail: All coaches from sessions:", tour?.coaches);
  console.log("TourDetail: Processed includes:", tour?.includes);
  console.log("TourDetail: Processed excludes:", tour?.excludes);
  console.log("TourDetail: Processed itinerary with steps:", tour?.itinerary);
  console.log("TourDetail: Next session price:", tour?.price);
  console.log("TourDetail: Next session deposit:", tour?.deposit);
  console.log("TourDetail: Experience level:", tour?.experienceLevel);
  console.log("TourDetail: Things needed:", tour?.thingsNeeded);
  console.log("TourDetail: Things to know:", tour?.thingsToKnow);
  console.log("TourDetail: Final processed highlights:", tour?.highlights);

  return tour;
};
