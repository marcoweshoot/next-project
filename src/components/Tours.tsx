'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ToursHero from '@/components/tours/ToursHero';
import ToursQuickLinks from '@/components/tours/ToursQuickLinks';
import ToursInfoSection from '@/components/tours/ToursInfoSection';
import ToursContent from '@/components/tours/ToursContent';
import ToursFAQ from '@/components/tours/ToursFAQ';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Tour } from '@/types';
import { request } from 'graphql-request';
import { GET_TOURS } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';

const TOURS_PER_PAGE = 6;

type Props = {
  initialTours: Tour[];
  heroImage: any;
  faqs: any[];
};

export default function Tours({ initialTours, heroImage, faqs }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allTours, setAllTours] = useState<Tour[]>(initialTours);
  const [hasMore, setHasMore] = useState(initialTours.length === TOURS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleClearSearch = () => setSearchTerm('');

  const loadMoreTours = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);

    try {
      const data = await request<{ tours: any[] }>(
        process.env.STRAPI_GRAPHQL_API!,
        GET_TOURS,
        {
          locale: 'it',
          limit: TOURS_PER_PAGE,
          start: allTours.length,
        }
      );

      const newTours = transformTours(data.tours);
      setAllTours((prev) => [...prev, ...newTours]);
      setHasMore(data.tours.length === TOURS_PER_PAGE);
    } catch (err) {
      console.error('Error loading more tours:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [allTours.length, hasMore, loadingMore]);

  const { isFetching } = useInfiniteScroll({
    hasMore,
    isLoading: loadingMore,
    onLoadMore: loadMoreTours,
  });

  return (
    <>
      <SEO
        title="Calendario Viaggi Fotografici - WeShoot.it"
        description="Scopri i nostri viaggi fotografici nel mondo. Destinazioni uniche, coach esperti e piccoli gruppi per un'esperienza fotografica indimenticabile."
        url="https://www.weshoot.it/viaggi-fotografici/"
      />

      <div className="min-h-screen bg-white">
        <Header />

        <ToursHero
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          heroImage={heroImage}
        />

        <ToursQuickLinks />

        <ToursContent
          tours={allTours}
          loading={false}
          loadingMore={loadingMore || isFetching}
          error={null}
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
          hasMore={hasMore}
        />
        <ToursInfoSection />
        <ToursFAQ faqs={faqs} />
        
      </div>

      <Footer />
    </>
  );
}
