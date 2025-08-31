import { GET_COLLECTION_DETAIL, GET_COLLECTIONS } from '@/graphql/queries';
import { getClient } from '@/lib/apolloClient';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollectionDetailHero from '@/components/collection-detail/CollectionDetailHero';
import CollectionDetailContent from '@/components/collection-detail/CollectionDetailContent';
import CollectionDetailTours from '@/components/collection-detail/CollectionDetailTours';
import CollectionDetailFAQ from '@/components/collection-detail/CollectionDetailFAQ';
import CollectionDetailError from '@/components/collection-detail/CollectionDetailError';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static'; // per SSG puro

type Params = { slug: string };
type Props = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  const client = getClient();

  try {
    const { data } = await client.query({
      query: GET_COLLECTIONS,
      variables: { locale: 'it' },
    });

    return (data.collections || []).map((collection: { slug: string }) => ({
      slug: collection.slug,
    }));
  } catch (error) {
    console.error('Errore in generateStaticParams:', error);
    return [];
  }
}

export default async function CollectionDetailPage({ params }: Props) {
  const client = getClient();
  const { slug } = await params;

  try {
    const { data } = await client.query({
      query: GET_COLLECTION_DETAIL,
      variables: { slug, locale: 'it' },
    });

    const collection = data?.collections?.[0];

    if (!collection) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        <SEO
          title={collection.seo?.metaTitle || `${collection.name} - Collezioni WeShoot`}
          description={collection.seo?.metaDescription || collection.excerpt}
          url={`https://www.weshoot.it/viaggi-fotografici/collezioni/${collection.slug}`}
          image={collection.image?.url}
        />

        <Header />

        <div>
          <CollectionDetailHero collection={collection} />
          <CollectionDetailContent collection={collection} />
          <CollectionDetailTours tours={collection.tours || []} />

          {collection.faqs && collection.faqs.length > 0 && (
            <CollectionDetailFAQ
              faqs={collection.faqs}
              collectionName={collection.name}
            />
          )}
        </div>

        <Footer />
      </div>
    );
  } catch (error) {
    return <CollectionDetailError error={error} />;
  }
}
