
import Link from "next/link";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Location {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: Array<{
    image?: Array<{
      url: string;
    }>;
  }>;
}

interface DestinationDetailLocationsProps {
  locations: Location[];
  destination?: {
    name: string;
    slug: string;
  };
  loading: boolean;
}

const DestinationDetailLocations: React.FC<{
  children?: React.ReactNode;
}> = ({
  locations,
  destination,
  loading,
  children
}) => {
  // Funzione per ottenere l'immagine principale di una location
  const getLocationMainImage = (location: Location) => {
    if (location.pictures && location.pictures.length > 0) {
      const firstPicture = location.pictures[0];
      if (firstPicture.image && firstPicture.image.length > 0) {
        return firstPicture.image[0]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      }
    }
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  if (locations.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Location da Fotografare
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Scopri i luoghi più fotografici e iconici di {destination?.name}
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Card key={location.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <Link href={`/viaggi-fotografici/destinazioni/${destination?.slug}/${location.slug}`} className="block">
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={getLocationMainImage(location)}
                      alt={location.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {location.title}
                      </h3>
                      {location.description && (
                        <p className="text-gray-200 text-sm line-clamp-2">
                          {location.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinationDetailLocations;
