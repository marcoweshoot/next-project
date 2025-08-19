
import { request } from 'graphql-request';
import { Metadata } from 'next';
import { GET_TOURS, GET_TOURS_PAGE } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import Tours from '@/components/Tours';
import { Tour } from '@/types';

const GRAPHQL_ENDPOINT = process.env.STRAPI_GRAPHQL_API!;

export const metadata: Metadata = {
  title: 'Viaggi Fotografici - WeShoot.it',
  description:
    'Scopri i nostri viaggi fotografici nel mondo. Destinazioni uniche, coach esperti e piccoli gruppi per un\'esperienza fotografica indimenticabile.',
  alternates: {
    canonical: 'https://www.weshoot.it/viaggi-fotografici/',
  },
};

type GetToursResponse = {
  tours: any[];
};

type GetToursPageResponse = {
  toursPage: {
    cover: any;
    faqs: any[];
  };
};

export default async function ToursPage() {
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

  const tours: Tour[] = transformTours(toursData.tours);
  const heroImage = toursPageData.toursPage?.cover || null;
  const faqs = toursPageData.toursPage?.faqs || [];

  return <Tours initialTours={tours} heroImage={heroImage} faqs={faqs} />;
}
