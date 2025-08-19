import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

interface DestinationDetailHeroProps {
  destination?: {
    name: string;
    slug: string;
    description: string;
    image: {
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
      backgroundImage={destination?.image?.url || "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif"}
      size="medium"
      className="pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
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
