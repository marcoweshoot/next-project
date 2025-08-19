import { getClient } from '@/lib/apolloClient';
import { GET_REVIEW_BY_ID, GET_REVIEWS } from '@/graphql/queries/reviews';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ReviewsHero from '@/components/reviews/ReviewsHero';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_REVIEWS,
    variables: { limit: 100 },
    fetchPolicy: 'no-cache',
  });

  const reviews = data?.reviews || [];
  return reviews.map((review: any) => ({
    id: review.id.toString(),
  }));
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const client = getClient();
  const reviewId = params.id;

  if (!reviewId) {
    return notFound();
  }

  const { data: allReviewsData } = await client.query({
    query: GET_REVIEWS,
    variables: { limit: 100 },
    fetchPolicy: 'no-cache',
  });

  const allReviews = allReviewsData?.reviews || [];
  const currentIndex = allReviews.findIndex((r: any) => r.id.toString() === reviewId);
  const previous = allReviews[currentIndex - 1];
  const next = allReviews[currentIndex + 1];

  const { data } = await client.query({
    query: GET_REVIEW_BY_ID,
    variables: { id: reviewId },
    fetchPolicy: 'no-cache',
  });

  const review = data?.review;
  if (!review) return notFound();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.user?.firstName ?? 'Utente',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.description,
    datePublished: review.created_at,
    itemReviewed: {
      '@type': 'Product',
      name: 'Tour WeShoot',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`Recensione di ${review.user?.firstName ?? 'Utente'}`}
        description={review.description.slice(0, 160)}
        url={`https://www.weshoot.it/recensioni/${review.id}`}
      />
      <Script
        type="application/ld+json"
        id="structured-data-review"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Header />

      {/* Sezione Hero */}
      <ReviewsHero totalReviews={allReviews.length} />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white p-8 shadow rounded-lg">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={review.user?.profilePicture?.url || ''}
                alt={review.user?.profilePicture?.alternativeText || review.user?.firstName || 'Utente'}
              />
              <AvatarFallback className="bg-orange-500 text-white font-bold">
                {review.user?.firstName?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {review.user?.firstName ?? 'Utente'}
              </h2>
              <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
              <div className="flex items-center mt-1">{renderStars(review.rating || 5)}</div>
            </div>
          </div>

          {review.title && (
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{review.title}</h3>
          )}

          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {review.description}
          </p>
        </div>

        {/* Navigazione */}
        <div className="flex flex-col sm:flex-row justify-between mt-10 gap-4">
          <Link
            href="/recensioni"
            className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Torna a tutte le recensioni
          </Link>

          <div className="flex gap-4 justify-end">
            {previous && (
              <Link
                href={`/recensioni/${previous.id}`}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" /> Precedente
              </Link>
            )}
            {next && (
              <Link
                href={`/recensioni/${next.id}`}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Successiva <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
