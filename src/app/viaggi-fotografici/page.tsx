// src/app/viaggi-fotografici/page.tsx
import { Metadata } from 'next';
import { request } from 'graphql-request';
import { GET_TOURS, GET_TOURS_PAGE } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import type { Tour } from '@/types';
import dynamicImport from 'next/dynamic';

// ⬇️ Navbar / Footer
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Lazy load dei componenti pesanti
const ToursList = dynamicImport(() => import('@/components/tours/ToursList.client'), {
  loading: () => <div className="min-h-screen bg-muted animate-pulse" />,
  ssr: true,
});

const ToursFAQ = dynamicImport(() => import('@/components/tours/ToursFAQServer'), {
  loading: () => <div className="py-16 bg-muted animate-pulse" />,
  ssr: true,
});

// ✅ SSG (pagina statica). Metti un numero se vuoi ISR (es. 600)
export const dynamic = 'force-static';
export const revalidate = false;

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
      <Header />

      <div className="min-h-screen bg-background">
        <ToursList initialTours={initialTours} heroImage={heroImage} />
        {faqs?.length ? <ToursFAQ faqs={faqs as any} /> : null}
      </div>

      <Footer />
    </>
  );
}
