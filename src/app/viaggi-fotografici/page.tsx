// src/app/viaggi-fotografici/page.tsx
import { Metadata } from 'next';
import { request } from 'graphql-request';
import { GET_TOURS, GET_TOURS_PAGE } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import ToursList from '@/components/tours/ToursList.client';
import ToursFAQ from '@/components/tours/ToursFAQServer';
import type { Tour } from '@/types';

// ✅ SSG con ISR: pagina statica rigenerata ogni 10 minuti
export const dynamic = 'force-static';
export const revalidate = false; // 600s = 10m

export const metadata: Metadata = {
  title: 'Viaggi Fotografici - WeShoot.it',
  description:
    "Scopri i nostri viaggi fotografici nel mondo. Destinazioni uniche, coach esperti e piccoli gruppi per un'esperienza fotografica indimenticabile.",
  alternates: {
    canonical: 'https://www.weshoot.it/viaggi-fotografici/',
  },
};

const GRAPHQL_ENDPOINT = process.env.STRAPI_GRAPHQL_API!;

type GetToursResponse = { tours: unknown[] };
type GetToursPageResponse = {
  toursPage: {
    cover?: unknown;
    faqs?: Array<{ id: string; question: string; answer: string }>;
  } | null;
};

export default async function Page() {
  const [toursData, toursPageData] = await Promise.all([
    request<GetToursResponse>(GRAPHQL_ENDPOINT, GET_TOURS, {
      locale: 'it',
      limit: 6,
      start: 0,
    }),
    request<GetToursPageResponse>(GRAPHQL_ENDPOINT, GET_TOURS_PAGE, {
      locale: 'it',
    }),
  ]);

  const initialTours = transformTours(toursData.tours) as Tour[];
  const heroImage = toursPageData.toursPage?.cover ?? null;
  const faqs = toursPageData.toursPage?.faqs ?? [];

  return (
    <>
      <ToursList initialTours={initialTours} heroImage={heroImage} />
      {/* FAQ sotto la lista */}
      {faqs?.length ? <ToursFAQ faqs={faqs as any} /> : null}
    </>
  );
}
