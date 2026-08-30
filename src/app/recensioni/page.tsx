import fs from 'node:fs/promises';
import path from 'node:path';
import { getClient } from '@/lib/apolloClient';
import { GET_REVIEWS } from '@/graphql/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewsHero from '@/components/reviews/ReviewsHero';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewsEmptyState from '@/components/reviews/ReviewsEmptyState';
import ReviewsError from '@/components/reviews/ReviewsError';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

async function getReviews() {
  // 1) Prova a leggere dallo snapshot
  try {
    const snapshotFile = path.join(process.cwd(), 'public', 'snapshots', 'reviews.json');
    const raw = await fs.readFile(snapshotFile, 'utf8');
    const reviews = JSON.parse(raw);
    if (Array.isArray(reviews) && reviews.length > 0) {
      console.log(`[REVIEWS] ✅ Caricato ${reviews.length} recensioni da snapshot`);
      return reviews;
    }
  } catch (err) {
    console.warn('[REVIEWS] ⚠️  Snapshot non disponibile, fallback a GraphQL:', err instanceof Error ? err.message : err);
  }

  // 2) Fallback a GraphQL (solo Strapi)
  try {
    const client = getClient();
    const { data } = await client.query({
      query: GET_REVIEWS,
      variables: { limit: 50 },
      fetchPolicy: 'no-cache',
    });
    return data?.reviews || [];
  } catch (err) {
    console.error('Errore durante il fetch delle recensioni:', err);
    throw err;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  let count = 0;
  try {
    count = (await getReviews()).length;
  } catch {
    // il conteggio è opzionale: in caso di errore resta 0
  }

  const title = 'Recensioni - Dicono di noi | WeShoot';
  const description = `${count}+ recensioni non possono sbagliare...`;

  return {
    title,
    description,
    alternates: { canonical: '/recensioni' },
    openGraph: { title, description, url: '/recensioni' },
  };
}

export default async function ReviewsPage() {
  let reviews: any[] = [];
  let error: unknown = null;

  try {
    reviews = await getReviews();
  } catch (err) {
    console.error('Errore durante il caricamento delle recensioni:', err);
    error = err;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      <Header />

      {/* Hero con background + breadcrumb */}
      <ReviewsHero totalReviews={reviews.length} />

      {/* Sezione con griglia recensioni */}
      <section className="py-16 bg-background">
        <div className="container">
          {error ? (
            <ReviewsError />
          ) : reviews.length === 0 ? (
            <ReviewsEmptyState />
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
