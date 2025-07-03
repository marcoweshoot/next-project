"use client";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from '@apollo/client';
import { GET_LOCATION_BY_SLUG } from '@/graphql/queries/location-detail';
import { processLocationData, processPicturesData, processToursData } from '@/utils/locationDataProcessors';

export const useLocationDetail = () => {
  const { stateSlug, locationSlug } = useParams();
  const pathname = usePathname();
  
  console.log("🔍 useLocationDetail - URL params:", { stateSlug, locationSlug });
  console.log("🔍 useLocationDetail - Query variables:", { slug: locationSlug, locale: 'it' });
  
  const { data, loading, error } = useQuery(GET_LOCATION_BY_SLUG, {
    variables: {
      slug: locationSlug,
      locale: 'it'
    },
    errorPolicy: 'all',
    onCompleted: (data) => {
      console.log("✅ useLocationDetail - Query completed successfully:", data);
    },
    onError: (error) => {
      console.error("❌ useLocationDetail - Query error:", error);
      console.error("❌ GraphQL errors:", error.graphQLErrors);
      console.error("❌ Network error:", error.networkError);
      console.error("❌ Error message:", error.message);
    }
  });

  console.log("🔍 useLocationDetail - Raw query result:", { 
    data, 
    loading, 
    error,
    dataExists: !!data,
    dataKeys: data ? Object.keys(data) : null,
    errorMessage: error?.message
  });

  // Extract data directly from locations
  const locationsData = data?.locations;
  
  console.log("🔍 useLocationDetail - Extracted data:", {
    locationsData: locationsData?.length || 0,
    hasLocationsData: Array.isArray(locationsData)
  });

  // Process location data
  const locationBase = processLocationData(locationsData, stateSlug as string);
  
  // Process pictures data from the location
  const pictures = processPicturesData(
    locationBase ? locationsData?.[0]?.pictures : [],
    [] // No additional pictures from separate query
  );

  // Get tours directly from the location data
  const locationTours = locationBase ? locationsData?.[0]?.tours || [] : [];

  // Create final location object
  const location = locationBase ? {
    ...locationBase,
    pictures
  } : null;

  console.log("🔍 useLocationDetail - Final location object:", location);
  console.log("🔍 useLocationDetail - Pictures processed:", pictures?.length || 0);

  // Process tours data directly from location
  const tours = processToursData(locationTours, locationSlug as string);

  console.log("🔍 useLocationDetail - Final processed tours:", tours);
  console.log("🔍 useLocationDetail - Final return values:", {
    location: !!location,
    tours: tours.length,
    loading,
    error: !!error,
    errorMessage: error?.message
  });

  return {
    pathname,
    tours,
    loading,
    error
  };
};
