import { getClient } from '@/lib/apolloClient';
import { GET_REVIEWS } from '@/graphql/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ReviewsHero from '@/components/reviews/ReviewsHero';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewsEmptyState from '@/components/reviews/ReviewsEmptyState';
import ReviewsError from '@/components/reviews/ReviewsError';

export const dynamic = 'force-static';

export default async function ReviewsPage() {
  let reviews = [];
  let error = null;

  try {
    const client = getClient();
    const { data } = await client.query({
      query: GET_REVIEWS,
      variables: { limit: 50 },
      fetchPolicy: 'no-cache'
    });
    reviews = data?.reviews || [];
  } catch (err) {
    console.error('Errore durante il fetch delle recensioni:', err);
    error = err;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Recensioni - Dicono di noi"
        description={`${reviews.length}+ recensioni non possono sbagliare...`}
        url="https://www.weshoot.it/recensioni"
      />

      <Header />

      {/* Hero con background + breadcrumb */}
      <ReviewsHero totalReviews={reviews.length} />

      {/* Sezione con griglia recensioni */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
