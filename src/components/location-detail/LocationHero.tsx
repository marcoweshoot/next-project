import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

interface LocationHeroProps {
  location: {
    title: string;
    slug: string;
    latitude: number;
    longitude: number;
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
  };
  stateSlug: string;
}

const LocationHero: React.FC<LocationHeroProps> = ({ location, stateSlug }) => {
  const hero = location.pictures?.[0];
  const heroUrl =
    hero?.url ||
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif';
  const heroAlt = hero?.alternativeText || hero?.title || location.title;

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Destinazioni', path: '/viaggi-fotografici/destinazioni/' },
    { name: location.state.name, path: `/viaggi-fotografici/destinazioni/${stateSlug}/` },
    { name: location.title, path: `/viaggi-fotografici/destinazioni/${stateSlug}/posti/${location.slug}` },
  ];

  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      {/* Hero image as true content image -> priority to fix LCP warning */}
      <Image
        src={heroUrl}
        alt={heroAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {location.title}
          </h1>

          <div className="flex justify-center mb-6">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          <div className="flex items-center justify-center mt-4 text-gray-200">
            <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>
              {location.latitude}°, {location.longitude}°
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationHero;
