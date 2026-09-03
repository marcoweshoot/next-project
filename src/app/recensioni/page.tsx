import { getAllReviews } from '@/lib/reviewsSnapshot';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewsHero from '@/components/reviews/ReviewsHero';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewsEmptyState from '@/components/reviews/ReviewsEmptyState';
import ReviewsError from '@/components/reviews/ReviewsError';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  let count = 0;
  try {
    count = (await getAllReviews()).length;
  } catch {
    // il conteggio è opzionale: in caso di errore resta 0
  }

  const title = 'Recensioni - Dicono di noi | WeShoot';
  const description = `${count}+ recensioni non possono sbagliare...`;

  return {
    title,
    description,
    alternates: { canonical: '/recensioni' },
  };
}

export default async function ReviewsPage() {
  let reviews: any[] = [];
  let error: unknown = null;

  try {
    reviews = await getAllReviews();
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
