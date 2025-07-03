
interface BreadcrumbElement {
  name: string;
  path?: string;
}

export const buildTourBreadcrumbs = (
  tour: any, 
  stateSlug?: string, 
  placeSlug?: string
): BreadcrumbElement[] => {
  const breadcrumbElements: BreadcrumbElement[] = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici' },
    { name: 'Destinazioni', path: '/viaggi-fotografici/destinazioni' }
  ];

  // Early return if tour is not available
  if (!tour) {
    return breadcrumbElements;
  }

  // Ensure states and places are arrays before using them
  const states = Array.isArray(tour?.states) ? tour.states : [];
  const places = Array.isArray(tour?.places) ? tour.places : [];

  // Use URL parameters first, then fallback to tour data
  if (stateSlug) {
    // Find state by slug from tour data
    const state = states.find((s: any) => s?.slug === stateSlug);
    const stateName = state?.name || stateSlug;
    
    breadcrumbElements.push({
      name: stateName,
      path: `/viaggi-fotografici/destinazioni/${stateSlug}`
    });
  } else if (states.length > 0) {
    // Fallback to first state
    const state = states[0];
    if (state?.name && state?.slug) {
      breadcrumbElements.push({
        name: state.name,
        path: `/viaggi-fotografici/destinazioni/${state.slug}`
      });
    }
  }

  if (placeSlug && stateSlug) {
    // Find place by slug from tour data
    const place = places.find((p: any) => p?.slug === placeSlug);
    const placeName = place?.name || placeSlug;
    
    breadcrumbElements.push({
      name: placeName,
      path: `/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}`
    });
  } else if (places.length > 0 && states.length > 0) {
    // Fallback to first place
    const place = places[0];
    const state = states[0];
    if (place?.name && place?.slug && state?.slug) {
      breadcrumbElements.push({
        name: place.name,
        path: `/viaggi-fotografici/destinazioni/${state.slug}/${place.slug}`
      });
    }
  }

  // Add current tour using slug instead of title
  breadcrumbElements.push({
    name: tour?.slug || 'tour'
  });

  return breadcrumbElements;
};
