import React from 'react';
import { getClient } from '@/lib/apolloClient';
import { GET_COURSES } from '@/graphql/queries/courses';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CoursesHero from '@/components/courses/CoursesHero';
import WhatIsWeShootSection from '@/components/courses/WhatIsWeShootSection';
import CoursesFeatures from '@/components/courses/CoursesFeatures';
import CoursesList from '@/components/courses/CoursesList';
import CoursesCTA from '@/components/courses/CoursesCTA';
import type { Metadata } from 'next';

// Forza SSG al build per ottimizzazione SEO e mobile
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Corsi di Fotografia - WeShoot',
  description:
    'Esplora i corsi di fotografia di WeShoot, adatti a tutti i livelli: dai principianti ai professionisti. Prenota ora il tuo corso.',
  alternates: { canonical: '/corsi-di-fotografia' },
  openGraph: {
    title: 'Corsi di Fotografia - WeShoot',
    description:
      'Esplora i corsi di fotografia di WeShoot, adatti a tutti i livelli: dai principianti ai professionisti. Prenota ora il tuo corso.',
    url: '/corsi-di-fotografia',
  },
};

export default async function CorsiFotografiaPage() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_COURSES,
    variables: { locale: 'it' },
  });

  const courses = data?.courses || [];

  return (
    <div className="min-h-screen bg-background">

      {/* Header globale */}
      <Header />

      {/* Hero section */}
      <CoursesHero />

      {/* Chi siamo e cosa facciamo */}
      <WhatIsWeShootSection />

      {/* Features principali */}
      <CoursesFeatures />

      {/* Lista dei corsi */}
      <CoursesList courses={courses} />

      {/* Call to Action */}
      <CoursesCTA />

      {/* Footer globale */}
      <Footer />
    </div>
  );
}
