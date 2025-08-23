type PageProps<T = any> = { params: Promise<T> };
import { notFound } from 'next/navigation';
import { gql } from 'graphql-request';
import { getClient } from '@/lib/graphqlClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import DestinationDetailHero from '@/components/destination-detail/DestinationDetailHero';
import DestinationDetailLocations from '@/components/destination-detail/DestinationDetailLocations';
import DestinationDetailTours from '@/components/destination-detail/DestinationDetailTours';
import DestinationDetailEmptyState from '@/components/destination-detail/DestinationDetailEmptyState';

export const dynamic = 'force-static';

const GET_DESTINATION_STATE_PAGE = gql`
  query GetDestinationStatePage($locale: String, $slug: String) {
    states(locale: $locale, where: { slug: $slug }) {
      id
      name
      slug
      description
      image { url }
      seo { metaTitle metaDescription }
    }

    locations(locale: $locale, where: { state: { slug: $slug } }) {
      id
      title
      slug
      description
      pictures { image { url } }
    }

    tours(locale: $locale, where: { states: { slug: $slug } }) {
      id
      title
      slug
      description
      difficulty
      image { url alternativeText }
      states { id name slug }
      places { id name slug }
      sessions {
        id
        start
        end
        price
        maxPax
        status
        users {
          id
          username
          firstName
          lastName
          profilePicture { id url alternativeText }
        }
      }
    }
  }
`;

const GET_ALL_STATE_SLUGS = gql`
  query GetAllStates {
    states { slug }
  }
`;

export async function generateStaticParams(): Promise<Array<{ stateslug: string }>> {
  const client = getClient();
  try {
    const data = await client.request(GET_ALL_STATE_SLUGS);
    const states = (data as { states?: { slug: string }[] }).states ?? [];
    return states.map((s) => ({ stateslug: s.slug }));
  } catch {
    return [];
  }
}

type RouteParams = { stateslug: string };

export default async function StatePage({ params }: PageProps<RouteParams>) {
  const { stateslug } = await params;
  const client = getClient();

  try {
    const response = await client.request(GET_DESTINATION_STATE_PAGE, {
      locale: 'it',
      slug: stateslug,
    });

    const { states, locations, tours } = (response ?? {}) as {
      states?: any[];
      locations?: any[];
      tours?: any[];
    };

    const destination = states?.[0];
    const locs = locations ?? [];
    const trs = tours ?? [];
    const loading = false;

    if (!destination && locs.length === 0 && trs.length === 0) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {destination && (
          <SEO
            title={destination.seo?.metaTitle || `${destination.name} - Viaggi Fotografici`}
            description={
              destination.seo?.metaDescription ||
              `Scopri i viaggi fotografici in ${destination.name}. Esplora paesaggi mozzafiato e cattura momenti indimenticabili.`
            }
            url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${stateslug}`}
          />
        )}

        <Header />

        <DestinationDetailHero
          destination={destination}
          loading={loading}
          destinationSlug={stateslug}
        />

        <DestinationDetailLocations
          locations={locs}
          destination={destination}
          loading={loading}
        />

        <DestinationDetailTours
          tours={trs}
          destination={destination}
          loading={loading}
        />

        {!loading && locs.length === 0 && trs.length === 0 && (
          <DestinationDetailEmptyState destinationName={destination?.name} />
        )}

        <Footer />
      </div>
    );
  } catch {
    notFound();
  }
}
