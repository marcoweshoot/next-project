import { Tour, Picture } from '@/types';

// ------------------------------------
// ✅ URL & Avatar helpers
// ------------------------------------
export const DEFAULT_COACH_AVATAR =
  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/Coach-WeShoot.avif';

// Converte qualunque input (relativo, protocol-relative, assoluto) in URL assoluto
export const getFullMediaUrl = (input?: string): string => {
  if (!input) return '';

  let url = input.trim();

  // //cdn.example.com/...  ->  https://cdn.example.com/...
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  // Se è già assoluto http/https, ok
  if (/^https?:\/\//i.test(url)) return url;

  // Prepara host base e compatta eventuali slash doppi
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL || 'https://api.weshoot.it').replace(/\/+$/, '');
  const path = ('/' + url).replace(/\/{2,}/g, '/'); // <-- niente // nel mezzo

  return `${base}${path}`;
};

// Ritorna sempre un avatar valido con URL assoluto e alt sensato
export const getCoachAvatar = (u?: {
  profilePicture?: { url?: string; alternativeText?: string };
  firstName?: string;
  username?: string;
}) => ({
  url: getFullMediaUrl(u?.profilePicture?.url) || DEFAULT_COACH_AVATAR,
  alt: u?.profilePicture?.alternativeText || u?.firstName || u?.username || 'Coach WeShoot',
});

// ------------------------------------
// ✅ Date & Price formatting
// ------------------------------------
export const formatDateRange = (start: string, duration: number): string => {
  if (!start) return `${duration === 1 ? '1 giorno' : `${duration} giorni`}`;

  try {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      return `${duration === 1 ? '1 giorno' : `${duration} giorni`}`;
    }

    const iso = startDate.toISOString().split('T')[0];
    const giorni = duration === 1 ? '1 giorno' : `${duration} giorni`;
    return `${iso} · ${giorni}`;
  } catch {
    return `${duration === 1 ? '1 giorno' : `${duration} giorni`}`;
  }
};

export const formatPrice = (
  value: number,
  locale = 'it-IT',
  currency = 'EUR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

// ------------------------------------
// ✅ Image / gallery processing
// ------------------------------------
interface ProcessedImage {
  id: string;
  title: string;
  url: string;
  alt: string;
}

export const processGalleryImages = (
  pictures: Picture[] = []
): ProcessedImage[] => {
  // console.log('📸 processGalleryImages > pictures:', pictures);

  return pictures
    .map((picture, index) => {
      // supporta: picture.url  |  picture.image?.url  |  picture.image?.[0]?.url
      const directUrl = (picture as any).url;
      const objUrl = (picture as any).image?.url;
      const arrUrl = Array.isArray((picture as any).image)
        ? (picture as any).image?.[0]?.url
        : undefined;

      const url = directUrl || objUrl || arrUrl;

      // alt preferibilmente da image, poi fallback su title
      const directAlt = (picture as any).alt;
      const objAlt = (picture as any).image?.alternativeText;
      const arrAlt = Array.isArray((picture as any).image)
        ? (picture as any).image?.[0]?.alternativeText
        : undefined;

      const alt = directAlt || objAlt || arrAlt || picture.title || 'Immagine galleria';

      if (!url) {
        // console.warn(`⚠️ picture url mancante o vuoto (index ${index}):`, picture);
        return null;
      }

      return {
        id: (picture as any).id?.toString() ?? `img-${index}`,
        title: picture.title || '',
        url: getFullMediaUrl(url),
        alt,
      };
    })
    .filter((img): img is ProcessedImage => Boolean(img));
};

// ------------------------------------
// ✅ Tour session & duration helpers
// ------------------------------------
export const getFutureSessions = (sessions: any[] = []) =>
  sessions.filter((s) => {
    const d = new Date(s?.start);
    return !isNaN(d.getTime()) && d > new Date();
  });

export const getLatestSession = (sessions: any[] = []) =>
  [...sessions]
    .filter((s) => !isNaN(new Date(s?.start).getTime()))
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())[0];

export const getNextSession = (sessions: any[]) =>
  getFutureSessions(sessions)[0] || getLatestSession(sessions) || null;

export const calculateTourDuration = (
  start?: string,
  end?: string
): number => {
  if (!start || !end) return 7;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 7;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
};

// ------------------------------------
// ✅ Coach helpers
// ------------------------------------
export const createDefaultCoach = (coaches: any[] = []) => {
  const coach = coaches?.[0];
  if (coach) {
    return {
      id: coach.id,
      name: coach.firstName
        ? `${coach.firstName} ${coach.lastName || ''}`.trim()
        : coach.username,
      avatar: getCoachAvatar(coach),
    };
  }
  return {
    id: 'default',
    name: 'Team WeShoot',
    avatar: { url: DEFAULT_COACH_AVATAR, alt: 'Team WeShoot' },
  };
};

export const getCoachesFromSessions = (sessions: any[] = []) => {
  const unique: Record<string, any> = {};
  sessions.forEach((s) => {
    s.coaches?.forEach((coach: any) => {
      if (coach?.id) unique[coach.id] = coach;
    });
  });
  return Object.values(unique);
};

// ------------------------------------
// ✅ Itinerary processing
// ------------------------------------
export const processItinerary = (days: any[]) =>
  days?.map((day, index) => ({
    day: index + 1,
    title: day.title,
    steps: day.steps || [],
  })) || [];

// ------------------------------------
// ✅ Difficulty normalization
// ------------------------------------
export const normalizeDifficulty = (
  difficulty?: string
): 'easy' | 'medium' | 'hard' => {
  const d = difficulty?.toLowerCase() || '';
  if (d.includes('easy') || d.includes('facile')) return 'easy';
  if (d.includes('hard') || d.includes('difficile')) return 'hard';
  return 'medium';
};

// ------------------------------------
// ✅ Search filtering
// ------------------------------------
export const filterTours = (tours: Tour[], searchTerm: string): Tour[] => {
  if (!searchTerm.trim()) return tours;
  const query = searchTerm.toLowerCase();
  return tours.filter((tour) =>
    tour.title?.toLowerCase().includes(query) ||
    tour.description?.toLowerCase().includes(query) ||
    tour.excerpt?.toLowerCase().includes(query) ||
    tour.states?.some((s) => s.name?.toLowerCase().includes(query)) ||
    tour.places?.some((p) => p.name?.toLowerCase().includes(query)) ||
    tour.coach?.name?.toLowerCase().includes(query)
  );
};

// ------------------------------------
// ✅ Destination helper
// ------------------------------------
export const getDestinationFromTour = (tour: any) => {
  const state = Array.isArray(tour.states) ? tour.states[0] : tour.states;
  const place = Array.isArray(tour.places) ? tour.places[0] : tour.places;

  return {
    id: state?.id || '1',
    name: place?.name || state?.name || 'Destinazione',
    slug: place?.slug || state?.slug || 'destinazione',
    country: state?.slug || 'stato',
  };
};

// ------------------------------------
// ✅ Trasforma i tour da GraphQL in oggetti Tour
//     (con coach.avatar sempre definito)
// ------------------------------------
export const transformTourData = (tour: any): Tour => {
  if (!tour) return {} as Tour;

  const futureSessions = getFutureSessions(tour.sessions || []);
  const latestSession = getLatestSession(tour.sessions || []);
  const displaySession = futureSessions[0] || latestSession;

  const firstCoach = displaySession?.users?.[0];
  const maxPax = displaySession?.maxPax ?? 0;
  const registeredUsers = displaySession?.users?.length ?? 0;
  const availableSpots = Math.max(0, maxPax - registeredUsers);

  const image = Array.isArray(tour.image) ? tour.image[0] : tour.image;

  const coachBlock = firstCoach
    ? {
        id: firstCoach.id,
        name: firstCoach.firstName || firstCoach.username || 'Coach WeShoot',
        slug: firstCoach.username || 'coach-weshoot',
        avatar: getCoachAvatar(firstCoach),
      }
    : {
        id: '1',
        name: 'Coach WeShoot',
        slug: 'coach-weshoot',
        avatar: { url: DEFAULT_COACH_AVATAR, alt: 'Coach WeShoot' },
      };

  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description || '',
    excerpt: tour.excerpt || '',
    difficulty: normalizeDifficulty(tour.difficulty),
    cover:
      image && image.url
        ? {
            url: getFullMediaUrl(image.url),
            alt: image.alternativeText || tour.title || '',
            gallery: [],
          }
        : { url: '', alt: tour.title || '', gallery: [] },
    startDate: displaySession?.start || '',
    endDate: displaySession?.end || '',
    duration: calculateTourDuration(displaySession?.start, displaySession?.end),
    price: displaySession?.price ?? 0,
    deposit: displaySession?.deposit ?? 0,
    availableSpots,
    maxParticipants: displaySession?.maxPax ?? 0,
    status: displaySession?.status,
    featured: tour.featured ?? false,
    coach: coachBlock,
    coaches: displaySession?.users || [],
    destination: getDestinationFromTour(tour),
    collection: tour.collections?.[0]
      ? {
          id: tour.collections[0].id,
          title: tour.collections[0].name,
          slug: tour.collections[0].slug,
        }
      : undefined,
    sessions: Array.isArray(tour.sessions) ? tour.sessions : [],
    states: Array.isArray(tour.states) ? tour.states : [],
    places: Array.isArray(tour.places) ? tour.places : [],
    highlights: tour.highlights || [],
    days: Array.isArray(tour.days) ? tour.days.map((day: any) => ({
      id: day.id, // Usiamo l'ID di Strapi come identificatore univoco
      day: day.number, // Mappiamo 'number' da Strapi a 'day' per il nostro componente
      title: day.title || '',
      description: '', // I giorni non hanno descrizione, solo gli steps
      steps: day.steps || [],
    })) : [],
  };
};

export const transformTours = (tours: any[]): Tour[] => {
  if (!Array.isArray(tours)) return [];

  return tours.map((tour: any): Tour => {
    const futureSessions = getFutureSessions(tour.sessions || []);
    const latestSession = getLatestSession(tour.sessions || []);
    const displaySession = futureSessions[0] || latestSession;

    const firstCoach = displaySession?.users?.[0];
    const maxPax = displaySession?.maxPax ?? 0;
    const registeredUsers = displaySession?.users?.length ?? 0;
    const availableSpots = Math.max(0, maxPax - registeredUsers);

    const image = Array.isArray(tour.image) ? tour.image[0] : tour.image;

    const coachBlock = firstCoach
      ? {
          id: firstCoach.id,
          name: firstCoach.firstName || firstCoach.username || 'Coach WeShoot',
          slug: firstCoach.username || 'coach-weshoot',
          avatar: getCoachAvatar(firstCoach),
        }
      : {
          id: '1',
          name: 'Coach WeShoot',
          slug: 'coach-weshoot',
          avatar: { url: DEFAULT_COACH_AVATAR, alt: 'Coach WeShoot' },
        };

    return {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description || '',
      excerpt: tour.excerpt || '',
      difficulty: normalizeDifficulty(tour.difficulty),
      cover:
        image && image.url
          ? {
              url: getFullMediaUrl(image.url),
              alt: image.alternativeText || tour.title || '',
              gallery: [],
            }
          : { url: '', alt: tour.title || '', gallery: [] },
      startDate: displaySession?.start || '',
      endDate: displaySession?.end || '',
      duration: calculateTourDuration(displaySession?.start, displaySession?.end),
      price: displaySession?.price ?? 0,
      deposit: displaySession?.deposit ?? 0,
      availableSpots,
      maxParticipants: displaySession?.maxPax ?? 0,
      status: displaySession?.status,
      featured: tour.featured ?? false,
      coach: coachBlock,
      coaches: displaySession?.users || [],
      destination: getDestinationFromTour(tour),
      collection: tour.collections?.[0]
        ? {
            id: tour.collections[0].id,
            title: tour.collections[0].name,
            slug: tour.collections[0].slug,
          }
        : undefined,
      sessions: Array.isArray(tour.sessions) ? tour.sessions : [],
      states: Array.isArray(tour.states) ? tour.states : [],
      places: Array.isArray(tour.places) ? tour.places : [],
      highlights: tour.highlights || [],
      days: Array.isArray(tour.days) ? tour.days.map((day: any) => ({
        id: day.id, // Usiamo l'ID di Strapi come identificatore univoco
        day: day.number, // Mappiamo 'number' da Strapi a 'day' per il nostro componente
        title: day.title || '',
        description: '', // I giorni non hanno descrizione, solo gli steps
        steps: day.steps || [],
      })) : [],
    };
  });
};

// ------------------------------------
// ✅ Card override (coach forzato) con fallback avatar
// ------------------------------------
export const transformTourForCard = (
  tour: any,
  photographerUsername: string,
  photographerName: string
): Tour => {
  const transformed = transformTours([tour])[0];

  return {
    ...transformed,
    coach: {
      id: photographerUsername,
      name: photographerName,
      slug: photographerUsername,
      avatar: transformed.coach?.avatar ?? { url: DEFAULT_COACH_AVATAR, alt: photographerName },
    },
  };
};
