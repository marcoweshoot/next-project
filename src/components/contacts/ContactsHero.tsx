import React from 'react';
import Image from 'next/image';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

const ContactsHero = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Contatti' }
  ];

  return (
    <section className="relative py-32 pt-40 overflow-hidden">
      {/* Immagine di sfondo ottimizzata */}
      <Image
        src="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif"
        alt="Contatti WeShoot"
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 1200px"
        className="object-cover object-center brightness-50"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Contattaci
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
          Siamo qui per aiutarti a vivere l'esperienza fotografica dei tuoi sogni
        </p>

        {/* Breadcrumbs */}
        <div className="flex justify-center">
          <PageBreadcrumbs elements={breadcrumbElements} />
        </div>
      </div>
    </section>
  );
};

export default ContactsHero;
