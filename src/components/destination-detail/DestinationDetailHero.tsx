
import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

interface DestinationDetailHeroProps {
  destination?: {
    name: string;
    slug: string;
    description?: string;
    image?: {
      url: string;
    };
  };
  loading: boolean;
  destinationSlug?: string;
}

const DestinationDetailHero: React.FC<DestinationDetailHeroProps> = ({
  destination,
  loading,
  destinationSlug
}) => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Destinazioni', path: '/viaggi-fotografici/destinazioni/' },
    { name: destination?.name || destinationSlug || 'Destinazione' }
  ];

  return (
    <PageHeader 
      backgroundImage={destination?.image?.url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
      size="medium"
      className="pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded w-64 mx-auto mb-6"></div>
            <div className="h-6 bg-white/20 rounded w-96 mx-auto"></div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Viaggi Fotografici in {destination?.name}
            </h1>
            {destination?.description ? (
              <div 
                className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: destination.description }}
              />
            ) : (
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Scopri le incredibili location fotografiche in {destination?.name}. Ogni angolo racconta una storia unica.
              </p>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex justify-center">
              <PageBreadcrumbs elements={breadcrumbElements} />
            </div>
          </>
        )}
      </div>
    </PageHeader>
  );
};

export default DestinationDetailHero;
