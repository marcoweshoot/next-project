
import React from 'react';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

const CoursesHero = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Corsi di Fotografia' }
  ];

  return (
    <section className="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center text-white pt-16">
      <div className="absolute inset-0 bg-black/50"></div>
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
        
        {/* Breadcrumbs */}
        <div className="flex justify-center">
          <PageBreadcrumbs elements={breadcrumbElements} />
        </div>
      </div>
    </section>
  );
};

export default CoursesHero;
