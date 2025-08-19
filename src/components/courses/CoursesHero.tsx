// components/courses/CoursesHero.tsx
import React from 'react';
import Image from 'next/image';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

const breadcrumbElements = [
  { name: 'WeShoot', path: '/' },
  { name: 'Corsi di Fotografia' },
];

// URL dell’immagine LCP
const HERO_BG_URL = 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif';

const CoursesHero: React.FC = () => (
  <section className="relative h-96 flex items-center justify-center text-white pt-16 overflow-hidden">
    {/* Next.js Image in background */}
    <Image
      src={HERO_BG_URL}
      alt="Paesaggio fotografico accademia WeShoot"
      priority
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      style={{ objectFit: 'cover', objectPosition: 'center' }}
    />

    {/* Overlay scuro per leggibilità */}
    <div className="absolute inset-0 bg-black/40" />

    {/* Contenuto in primo piano */}
    <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Accademia di Fotografia WeShoot
      </h1>
      <h2 className="text-xl md:text-2xl text-gray-200 mb-6">
        Impara la fotografia con i migliori coach italiani
      </h2>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
        Passa dalle basi della fotografia ad essere pubblicato su giornali internazionali 
        in meno di 6 mesi con il sistema WeShoot.
      </p>
      <div className="flex justify-center">
        <PageBreadcrumbs elements={breadcrumbElements} />
      </div>
    </div>
  </section>
);

export default React.memo(CoursesHero);
