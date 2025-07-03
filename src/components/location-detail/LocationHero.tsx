
import React from 'react';
import { MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

interface LocationHeroProps {
  location: {
    title: string;
    latitude?: number;
    longitude?: number;
    state: {
      name: string;
      slug: string;
    };
    pictures: Array<{
      id: string;
      title: string;
      url: string;
      alternativeText: string;
    }>;
  } | null;
  stateSlug: string;
}

const LocationHero: React.FC<LocationHeroProps> = ({ location, stateSlug }) => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Destinazioni', path: '/viaggi-fotografici/destinazioni/' },
    { name: location?.state?.name || 'Destinazione', path: `/viaggi-fotografici/destinazioni/${stateSlug}/` },
    { name: location?.title || 'Location' }
  ];

  return (
    <PageHeader 
      backgroundImage={location?.pictures?.[0]?.url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'}
      size="medium"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          {location?.title || 'Location'}
        </h1>
        
        {/* Breadcrumbs */}
        <div className="flex justify-center mb-6">
          <PageBreadcrumbs elements={breadcrumbElements} />
        </div>
        
        {/* Location coordinates */}
        {location?.latitude && location?.longitude && (
          <div className="flex items-center justify-center mt-4 text-gray-300">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{location.latitude}°, {location.longitude}°</span>
          </div>
        )}
      </div>
    </PageHeader>
  );
};

export default LocationHero;
