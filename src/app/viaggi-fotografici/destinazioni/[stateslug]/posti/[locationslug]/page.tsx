import { notFound } from 'next/navigation';
import { gql } from 'graphql-request';
import { getClient } from '@/lib/graphqlClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import LocationHero from '@/components/location-detail/LocationHero';
import LocationContent from '@/components/location-detail/LocationContent';
import LocationTours from '@/components/location-detail/LocationTours';

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
};

const GET_DESTINATION_PLACE_PAGE = gql`
  query GetDestinationPlacePage($stateSlug: String!, $placeSlug: String!) {
    states(where: { slug: $stateSlug }) {
      id
      name
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

export default async function Page({ params }: Props) {
  const { stateslug, locationslug } = await params;

  const stateSlug = stateslug.replace(/-+$/, '');
  const placeSlug = locationslug.replace(/-+$/, '');

  const client = getClient();
  try {
    const data = await client.request<QueryResult>(
      GET_DESTINATION_PLACE_PAGE,
      { stateSlug, placeSlug }
    );

    const destination = data.states?.[0];
    const location = data.locations?.[0];

    if (!destination || !location) {
      return notFound();
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
      <div className="min-h-screen bg-gray-50">
        <SEO
          title={`${location.title} - Viaggi Fotografici ${destination.name}`}
          description={`Scopri ${location.title} in ${destination.name}. Una delle location più belle per i tuoi scatti fotografici.`}
          url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${stateSlug}/posti/${placeSlug}`}
        />

        <Header />
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
  } catch (error: any) {
    console.error('❌ Errore caricamento pagina:', error.response || error);
    return notFound();
  }
}
