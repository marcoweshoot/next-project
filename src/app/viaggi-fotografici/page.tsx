export const dynamicConfig = 'force-static';

import { Metadata } from 'next';
import { request } from 'graphql-request';
import { GET_TOURS, GET_TOURS_PAGE } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import type { Tour } from '@/types';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToursQuickLinks from '@/components/tours/ToursQuickLinks';
import ToursInfoSection from '@/components/tours/ToursInfoSection';
import ToursFAQ from '@/components/tours/ToursFAQServer'; // versione con <span> nel trigger
import dynamic from 'next/dynamic';

// carica l’isola client separata
const ToursList = dynamic(() => import('@/components/tours/ToursList.client'));

const GRAPHQL_ENDPOINT = process.env.STRAPI_GRAPHQL_API!;

export const metadata: Metadata = {
  title: 'Viaggi Fotografici 2025-2026 | Tour e Workshop di Paesaggio - WeShoot',
  description:
    "Scopri i nostri viaggi fotografici nel mondo. Destinazioni uniche, coach esperti e piccoli gruppi per un'esperienza fotografica indimenticabile.",
  alternates: { canonical: 'https://www.weshoot.it/viaggi-fotografici/' },
};

type GetToursResponse = { tours: any[] };
type GetToursPageResponse = { toursPage: { cover?: any | null; faqs?: any[] | null } | null };

export default async function Page() {
  const [toursData, toursPageData] = await Promise.all([
    request<GetToursResponse>(GRAPHQL_ENDPOINT, GET_TOURS, { locale: 'it', limit: 6, start: 0 }),
    request<GetToursPageResponse>(GRAPHQL_ENDPOINT, GET_TOURS_PAGE, { locale: 'it' }),
  ]);

  const initialTours: Tour[] = transformTours(toursData.tours);
  const heroImage = toursPageData.toursPage?.cover ?? null;
  const faqs = toursPageData.toursPage?.faqs ?? [];

  return (
    <>
      {/* niente <SEO/>: ci pensa `metadata` */}
      <div className="min-h-screen bg-white">
        <Header />

        {/* se vuoi mantenere l’ordine originale (Hero poi QuickLinks),
            lascia QuickLinks QUI sotto l’isola client */}
        <ToursList initialTours={initialTours} heroImage={heroImage} />
        <ToursQuickLinks />

        <ToursInfoSection />
        <ToursFAQ faqs={faqs as any[]} />
      </div>

      <Footer />
    </>
  );
}
