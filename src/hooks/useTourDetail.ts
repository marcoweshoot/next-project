"use client" ;

import { useParams, usePathname } from "next/navigation";
import { useQuery } from '@apollo/client';
import { GET_TOUR_BY_SLUG } from '@/graphql/queries/tours';
import { useTourTransformation } from './useTourTransformation';
import { useTourAnalytics } from './useTourAnalytics';

export const useTourDetail = () => {
  const { stateslug, placeslug, tourslug } = useParams();
  const pathname = usePathname();
  
  const { data, loading, error } = useQuery(GET_TOUR_BY_SLUG, {
    variables: {
      locale: 'it'
    },
    errorPolicy: 'all'
  });

  console.log("TourDetail: Query data:", data);
  console.log("TourDetail: Loading:", loading);
  console.log("TourDetail: Error:", error);
  console.log("TourDetail: Tour slug from params:", tourslug);

  // Filter the tour by slug from the results
  const tourData = data?.tours?.find((tour: any) => tour.slug === tourslug);
  console.log("TourDetail: Found tour data:", tourData);

  // Transform the raw tour data into the expected format
  const tour = useTourTransformation(tourData);

  // Handle analytics tracking
  useTourAnalytics(tour);

  return {
    tour,
    loading,
    error,
    stateSlug: stateslug,
    placeSlug: placeslug,
    tourSlug: tourslug
  };
};
