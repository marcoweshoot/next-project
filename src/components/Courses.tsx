"use client"

import React from 'react';
import { useQuery } from '@apollo/client';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GET_COURSES } from '@/graphql/queries';
import WhatIsWeShootSection from '@/components/courses/WhatIsWeShootSection';
import CoursesFeatures from '@/components/courses/CoursesFeatures';
import CoursesList from '@/components/courses/CoursesList';
import CoursesCTA from '@/components/courses/CoursesCTA';

const Courses = () => {
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(GET_COURSES, {
    variables: { locale: 'it' }
  });

  console.log("=== COURSES PAGE DEBUG ===");
  console.log("Courses data:", coursesData);
  console.log("========================");

  const courses = coursesData?.courses || [];

  const breadcrumbElements = [
    { name: "WeShoot", path: "/" },
    { name: "Corsi di Fotografia" }
  ];

  if (coursesError) {
    console.error('Error loading courses:', coursesError);
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="Errore nel caricamento" />
        <Header />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto text-center py-12">
            <Alert>
              <AlertDescription>
                Errore nel caricamento dei corsi. Riprova più tardi.
                <div className="mt-2 text-sm">Errore: {coursesError.message}</div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Corsi di Fotografia Online - Accademia WeShoot"
        description="Scopri i nostri corsi di fotografia online. Dalla tecnica di base alla fotografia professionale, impara con i migliori coach WeShoot."
        url="https://www.weshoot.it/corsi-di-fotografia/"
      />
      
      <Header />
      
      {/* Hero Section - usando un'immagine statica come nella pagina Collections */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20">
        <div className="absolute inset-0 bg-black/40" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80)`
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Accademia di Fotografia WeShoot
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Impara la fotografia con i migliori coach italiani
            </p>
            
            {/* Breadcrumbs */}
            <div className="flex justify-center">
              <PageBreadcrumbs elements={breadcrumbElements} className="text-gray-300" />
            </div>
          </div>
        </div>
      </section>

      <WhatIsWeShootSection />
      <CoursesFeatures />
      
      {coursesLoading ? (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <CoursesList courses={courses} />
      )}
      
      <CoursesCTA />
      <Footer />
    </div>
  );
};

export default Courses;
