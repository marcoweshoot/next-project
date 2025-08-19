import React from 'react';
import { getClient } from '@/lib/apolloClient';
import { GET_COURSES } from '@/graphql/queries/courses';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CoursesHero from '@/components/courses/CoursesHero';
import WhatIsWeShootSection from '@/components/courses/WhatIsWeShootSection';
import CoursesFeatures from '@/components/courses/CoursesFeatures';
import CoursesList from '@/components/courses/CoursesList';
import CoursesCTA from '@/components/courses/CoursesCTA';

// Forza SSG al build per ottimizzazione SEO e mobile
export const dynamic = 'force-static';

export default async function CorsiFotografiaPage() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_COURSES,
    variables: { locale: 'it' },
  });

  const courses = data?.courses || [];

  return (
    <>
      {/* Meta tags per SEO */}
      <SEO
        title="Corsi di Fotografia – WeShoot"
        description="Esplora i corsi di fotografia di WeShoot, adatti a tutti i livelli: dai principianti ai professionisti. Prenota ora il tuo corso."
        url="https://www.weshoot.it/corsi-di-fotografia"
      />

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
    </>
  );
}
