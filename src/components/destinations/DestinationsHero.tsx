import React from 'react';
import Image from 'next/image';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { MapPin, Users, Star } from 'lucide-react';

const DestinationsHero: React.FC = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Destinazioni' },
  ];

  const videoUrl =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/videos/weshoot-viaggi-fotografici-destinazioni.mp4';

  const posterUrl =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />

        {/* ✅ Static image for mobile (lazy-loaded with <Image />) */}
        <div className="relative block md:hidden w-full h-full">
          <Image
            src={posterUrl}
            alt="Poster"
            fill
            sizes="100vw"
            className="object-cover"
            loading="lazy"
          />
        </div>

        {/* ✅ Background video only for md+ */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          className="hidden md:block w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Foreground content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Incredibili destinazioni per i tuoi viaggi fotografici
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Esplora le destinazioni più affascinanti del mondo attraverso l'obiettivo della tua
            fotocamera. Ogni viaggio è un'opportunità per catturare la bellezza unica di luoghi
            straordinari.
          </p>

          {/* Breadcrumbs */}
          <div className="flex justify-center mb-8">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <MapPin className="w-5 h-5" />
              <span className="drop-shadow">Destinazioni Uniche</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Users className="w-5 h-5" />
              <span className="drop-shadow">Piccoli Gruppi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Star className="w-5 h-5" />
              <span className="drop-shadow">Coach Esperti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default DestinationsHero;
