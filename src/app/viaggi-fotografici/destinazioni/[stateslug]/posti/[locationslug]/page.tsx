import { notFound, permanentRedirect } from 'next/navigation';
import { gql } from 'graphql-request';
import { getClient } from '@/lib/graphqlClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocationHero from '@/components/location-detail/LocationHero';
import LocationContent from '@/components/location-detail/LocationContent';
import LocationTours from '@/components/location-detail/LocationTours';
import { ViewCategoryTracker } from '@/components/analytics/ViewCategoryTracker';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type Session = { id: string; start: string; end: string; price: number; maxPax: number; status: string };
type Tour = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty?: string;
  image?: { url: string; alternativeText?: string };
  sessions: Session[];
  states: { id: string; name: string; slug: string }[];
};
type Location = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  latitude: number;
  longitude: number;
  pictures: {
    id: string;
    title?: string;
    image: { url: string; alternativeText?: string }[];
  }[];
  state: { name: string; slug: string };
  tours: Tour[];
};
type QueryResult = {
  states: { id: string; name: string; slug: string }[];
  locations: Location[];
  // `place` è un'entità distinta da `location` su Strapi (area/regione vs singolo spot).
  // Serve solo a capire se uno slug che non è una location è invece un place, per
  // reindirizzarlo invece di restituire 404.
  places: { slug: string }[];
};

const GET_DESTINATION_PLACE_PAGE = gql`
  query GetDestinationPlacePage($stateSlug: String!, $placeSlug: String!) {
    states(where: { slug: $stateSlug }) {
      id
      name
      slug
    }
    places(where: { slug: $placeSlug }) {
      slug
    }
    locations(
      where: { slug: $placeSlug, state: { slug: $stateSlug } }
    ) {
      id
      title
      slug
      description
      latitude
      longitude
      pictures {
        id
        title
        image(limit: 1) {
          url
          alternativeText
        }
      }
      state {
        name
        slug
      }
      # Ecco il nested fetch dei tour
      tours {
        id
        title
        slug
        description
        difficulty
        image {
          url
          alternativeText
        }
        sessions {
          id
          start
          end
          price
          maxPax
          status
        }
        states {
          id
          name
          slug
        }
        places {
          id
          name
          slug
        }
      }
    }
  }
`;

const GET_ALL_STATE_PLACE_SLUGS = gql`
  query GetAllStatePlaceSlugs {
    locations {
      slug
      state {
        slug
      }
    }
  }
`;

export async function generateStaticParams() {
  const client = getClient();
  try {
    const { locations } = await client.request<{
      locations: { slug: string; state: { slug: string } }[];
    }>(GET_ALL_STATE_PLACE_SLUGS);

    return locations.map((loc) => ({
      stateslug: loc.state.slug,
      locationslug: loc.slug,
    }));
  } catch (error) {
    console.error('Errore in generateStaticParams:', error);
    return [];
  }
}

interface Props {
  params: Promise<{
    stateslug: string;
    locationslug: string;
  }>;
}

// Gli slug con caratteri accentati (es. dyrhólaey) arrivano percent-encoded
// dal segmento di URL: vanno decodificati prima di interrogare Strapi.
const decodeSlug = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const GET_PLACE_SEO = gql`
  query GetPlaceSeo($stateSlug: String, $placeSlug: String) {
    states(where: { slug: $stateSlug }) {
      name
    }
    locations(where: { slug: $placeSlug }) {
      title
    }
  }
`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateslug, locationslug } = await params;
  const stateSlug = decodeSlug(stateslug).replace(/-+$/, '');
  const placeSlug = decodeSlug(locationslug).replace(/-+$/, '');

  try {
    const data = await getClient().request<{
      states?: { name: string }[];
      locations?: { title: string }[];
    }>(GET_PLACE_SEO, { stateSlug, placeSlug });

    const destination = data?.states?.[0];
    const location = data?.locations?.[0];
    if (!destination || !location) return {};

    const title = `${location.title} - Viaggi Fotografici ${destination.name} | WeShoot`;
    const description = `Scopri ${location.title} in ${destination.name}. Una delle location più belle per i tuoi scatti fotografici.`;
    const url = `/viaggi-fotografici/destinazioni/${stateSlug}/posti/${placeSlug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
    };
  } catch {
    return {};
  }
}

export default async function Page({ params }: Props) {
  const { stateslug, locationslug } = await params;

  const stateSlug = decodeSlug(stateslug).replace(/-+$/, '');
  const placeSlug = decodeSlug(locationslug).replace(/-+$/, '');

  const client = getClient();

  // Il try racchiude solo la chiamata di rete: notFound() e permanentRedirect()
  // lanciano un'eccezione di controllo (NEXT_HTTP_ERROR_FALLBACK / NEXT_REDIRECT) che,
  // se intercettata qui, verrebbe loggata come errore e il redirect degraderebbe in 404.
  let data: QueryResult;
  try {
    data = await client.request<QueryResult>(
      GET_DESTINATION_PLACE_PAGE,
      { stateSlug, placeSlug }
    );
  } catch (error: any) {
    console.error('❌ Errore GraphQL pagina location:', error?.response || error);
    notFound();
  }

  const destination = data.states?.[0];
  const location = data.locations?.[0];

  // Slug come `canarie`, `toscana`, `lofoten` sono `places` (aree), non `locations`:
  // questa route risolve solo le locations, quindi mandiamo il place sulla pagina dello
  // stato, che elenca già tutte le sue locations. La location viene cercata per prima,
  // così gli slug che esistono in entrambe le entità continuano a servire la location.
  if (!location && data.places?.[0]) {
    permanentRedirect(`/viaggi-fotografici/destinazioni/${stateSlug}`);
  }

  if (!destination || !location) {
    notFound();
  }

  // Tutti i tour legati a questa location
  const tours = location.tours;

  const locationMapped = {
    title: location.title,
    slug: location.slug,
    latitude: location.latitude,
    longitude: location.longitude,
    state: location.state,
    description: location.description,
    pictures: location.pictures.map((pic) => {
      const img = pic.image[0];
      return {
        id: pic.id,
        title: pic.title ?? '',
        url: img?.url ?? '',
        alternativeText: img?.alternativeText ?? '',
      };
    }),
  };

  return (
    <div className="min-h-screen bg-background">

      <Header />
      
      {/* Track ViewCategory event for Facebook Pixel */}
      <ViewCategoryTracker
        categoryName={`${location.title} - ${destination.name}`}
        categoryType="Location"
        contentIds={tours.map((t: Tour) => t.id)}
      />
      
      <LocationHero location={locationMapped} stateSlug={stateSlug} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LocationContent location={locationMapped} loading={false} />
          <LocationTours tours={tours} locationTitle={location.title} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
