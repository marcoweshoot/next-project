import React from 'react';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { MapPin, Users, Star } from 'lucide-react';

const CollectionsHero: React.FC = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Collezioni' },
  ];

  const videoUrl =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/videos/aurora-boreale-viaggio-fotografico-norvegia-2.mp4';

  const posterUrl =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif';

  return (
    <section
      // 3 righe: [spazio elastico][CONTENUTO CENTRALE][spazio elastico]
      className="relative min-h-[88svh] md:min-h-[92svh] grid grid-rows-[1fr_auto_1fr] overflow-hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Collections Hero"
    >
      {/* Background video + overlay */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          className="w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Riga centrale: titolo + testo + breadcrumbs + quick stats */}
      <div className="relative z-20 row-start-2 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 md:gap-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Collezioni Tematiche
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl">
            Scopri le nostre collezioni di viaggi fotografici organizzate per tema. Ogni collezione
            raccoglie esperienze uniche accomunate da soggetti e stili fotografici specifici.
          </p>

          {/* Breadcrumbs */}
          <div className="flex justify-center">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl w-full">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4 text-white">
              <MapPin className="w-5 h-5" />
              <span className="drop-shadow">Temi Unici</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4 text-white">
              <Users className="w-5 h-5" />
              <span className="drop-shadow">Piccoli Gruppi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4 text-white">
              <Star className="w-5 h-5" />
              <span className="drop-shadow">Coach Specializzati</span>
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

export default CollectionsHero;
