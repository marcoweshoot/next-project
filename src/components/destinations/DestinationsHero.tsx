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
    <section
      // 3 righe: [spazio elastico][CONTENUTO CENTRALE][spazio elastico]
      className="relative min-h-[88svh] md:min-h-[92svh] grid grid-rows-[1fr_auto_1fr] overflow-hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Destinations Hero"
    >
      {/* Background layer */}
      <div className="absolute inset-0 z-0" aria-hidden>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />

        {/* Static image for mobile */}
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

        {/* Background video only for md+ */}
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

      {/* Riga centrale: TITOLO + TESTO + BREADCRUMBS + QUICK STATS (blocco unico, centrato) */}
      <div className="relative z-20 row-start-2 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 md:gap-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Incredibili destinazioni per i tuoi viaggi fotografici
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl">
            Esplora le destinazioni più affascinanti del mondo attraverso l'obiettivo della tua
            fotocamera. Ogni viaggio è un'opportunità per catturare la bellezza unica di luoghi
            straordinari.
          </p>

          {/* Breadcrumbs */}
          <div className="flex justify-center">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl w-full">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4 text-white">
              <MapPin className="w-5 h-5" />
              <span className="drop-shadow">Destinazioni Uniche</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4 text-white">
              <Users className="w-5 h-5" />
              <span className="drop-shadow">Piccoli Gruppi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4 text-white">
              <Star className="w-5 h-5" />
              <span className="drop-shadow">Coach Esperti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator centrato + cliccabile */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <a
          href="#contenuti"
          aria-label="Scorri per scoprire"
          className="flex flex-col items-center"
        >
          <span className="text-[10px] tracking-wide uppercase text-white/90">Scorri</span>
          <div className="mt-1 w-6 h-10 border-2 border-white rounded-full flex justify-center items-start">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
};

export default DestinationsHero;
