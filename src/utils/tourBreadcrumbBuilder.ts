export interface BreadcrumbElement {
  name: string;
  path?: string;
}

const BASE = '/viaggi-fotografici/destinazioni';

interface Tour {
  slug?: string;
  states?: Array<{ slug?: string; name?: string }>;
  places?: Array<{ slug?: string; name?: string }>;
}

export const buildTourBreadcrumbs = (
  tour: Tour | null | undefined,
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
    const state = states.find((s) => s?.slug === stateSlug);
    crumbs.push({ name: state?.name || stateSlug, path: `${BASE}/${stateSlug}` });
  } else if (states[0]?.slug) {
    crumbs.push({ name: states[0].name, path: `${BASE}/${states[0].slug}` });
  }

  // Area (place): solo contesto, senza link.
  // `place` e `location` sono entità distinte su Strapi e la route /posti/ risolve
  // esclusivamente le location, quindi un link costruito da un place porta a 404.
  // I place non hanno una pagina propria: restano testo nel breadcrumb.
  const place = placeSlug
    ? places.find((p) => p?.slug === placeSlug) ?? { slug: placeSlug, name: placeSlug }
    : places[0];
  if (place?.slug) {
    crumbs.push({ name: place.name || place.slug });
  }

  // Tour corrente non linkato
  crumbs.push({ name: tour?.slug || 'tour' });

  return crumbs;
};
