
import React from 'react';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

const ContactsHero = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Contatti' }
  ];

  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-32 pt-40">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
