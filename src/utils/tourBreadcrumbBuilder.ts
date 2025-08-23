export interface BreadcrumbElement {
  name: string;
  path?: string;
}

const BASE = '/viaggi-fotografici/destinazioni';

export const buildTourBreadcrumbs = (
  tour: any,
  stateSlug?: string,
  placeSlug?: string
): BreadcrumbElement[] => {
  const crumbs: BreadcrumbElement[] = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici' },
    { name: 'Destinazioni', path: BASE },
  ];

  if (!tour) return crumbs;

  const states = Array.isArray(tour?.states) ? tour.states : [];
  const places = Array.isArray(tour?.places) ? tour.places : [];

  // Stato
  if (stateSlug) {
    const state = states.find((s: any) => s?.slug === stateSlug);
    crumbs.push({ name: state?.name || stateSlug, path: `${BASE}/${stateSlug}` });
  } else if (states[0]?.slug) {
    crumbs.push({ name: states[0].name, path: `${BASE}/${states[0].slug}` });
  }

  // Location (⚠️ con /posti/)
  const effectiveState = stateSlug || states[0]?.slug;
  if (effectiveState) {
    if (placeSlug) {
      const place = places.find((p: any) => p?.slug === placeSlug);
      crumbs.push({
        name: place?.name || placeSlug,
        path: `${BASE}/${effectiveState}/posti/${placeSlug}`,
      });
    } else if (places[0]?.slug) {
      crumbs.push({
        name: places[0].name,
        path: `${BASE}/${effectiveState}/posti/${places[0].slug}`,
      });
    }
  }

  // Tour corrente non linkato
  crumbs.push({ name: tour?.slug || 'tour' });

  return crumbs;
};
