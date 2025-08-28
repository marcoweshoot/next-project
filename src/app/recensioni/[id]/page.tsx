// app/recensioni/[id]/page.tsx
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
  return reviews.map((review: any) => ({ id: review.id.toString() }));
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params;
  const client = getClient();
  const reviewId = id;

  if (!reviewId) return notFound();

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const renderStars = (rating: number) => (
    <div className="flex items-center" aria-label={`Valutazione ${rating} su 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'h-5 w-5 text-yellow-400 fill-yellow-400'
              : 'h-5 w-5 text-muted-foreground fill-transparent'
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: review.user?.firstName ?? 'Utente' },
    reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    reviewBody: review.description,
    datePublished: review.created_at,
    itemReviewed: { '@type': 'Product', name: 'Tour WeShoot' },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO
        title={`Recensione di ${review.user?.firstName ?? 'Utente'}`}
        description={(review.description || '').slice(0, 160)}
        url={`https://www.weshoot.it/recensioni/${review.id}`}
      />
      <Script
        type="application/ld+json"
        id="structured-data-review"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Header />

      {/* Hero */}
      <ReviewsHero totalReviews={allReviews.length} />

      <main className="container max-w-3xl py-16">
        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={review.user?.profilePicture?.url || ''}
                alt={
                  review.user?.profilePicture?.alternativeText ||
                  review.user?.firstName ||
                  'Utente'
                }
              />
              <AvatarFallback className="bg-orange-500 text-white font-bold">
                {review.user?.firstName?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {review.user?.firstName ?? 'Utente'}
              </h2>
              <p className="text-sm text-muted-foreground">{formatDate(review.created_at)}</p>
              <div className="mt-1">{renderStars(review.rating || 5)}</div>
            </div>
          </div>

          {review.title && (
            <h3 className="mb-4 text-xl font-semibold text-foreground">{review.title}</h3>
          )}

          <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {review.description}
          </p>
        </div>

        {/* Navigazione */}
        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row">
          <Link
            href="/recensioni"
            className="inline-flex items-center gap-2 rounded font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna a tutte le recensioni
          </Link>

          <div className="flex justify-end gap-4">
            {previous && (
              <Link
                href={`/recensioni/${previous.id}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Precedente
              </Link>
            )}
            {next && (
              <Link
                href={`/recensioni/${next.id}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Successiva
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
