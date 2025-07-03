"use client"
import { useParams } from "next/navigation";
import React from 'react';
import { useQuery } from '@apollo/client';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GET_COURSES } from '@/graphql/queries/courses';
import CourseDetailHero from '@/components/course-detail/CourseDetailHero';
import CourseInfoCard from '@/components/course-detail/CourseInfoCard';
import CourseContent from '@/components/course-detail/CourseContent';
import CourseTeacher from '@/components/course-detail/CourseTeacher';
import CourseTeacherPhotos from '@/components/course-detail/CourseTeacherPhotos';
import CourseFAQ from '@/components/course-detail/CourseFAQ';
import CourseSidebar from '@/components/course-detail/CourseSidebar';
import CourseDetailCTA from '@/components/course-detail/CourseDetailCTA';

const CourseDetail = () => {
  const { slug } = useParams();
  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: {
      locale: 'it'
    }
  });

  console.log("CourseDetail: Slug:", slug);
  console.log("CourseDetail: Query data:", data);
  console.log("CourseDetail: Loading:", loading);
  console.log("CourseDetail: Error:", error);

  const courses = data?.courses || [];
  const course = courses.find(c => c.slug === slug);

  if (loading) {
    return (
      <>
        <SEO title="Caricamento corso..." />
        <div className="min-h-screen bg-white pt-16">
          <div className="h-96 bg-gray-200 animate-pulse" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO title="Errore nel caricamento" />
        <div className="min-h-screen bg-white pt-16">
          <div className="container mx-auto px-4 py-16">
            <Alert>
              <AlertDescription>
                Errore nel caricamento del corso. Riprova più tardi.
                <div className="mt-2 text-sm">Errore: {error.message}</div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <SEO title="Corso non trovato" />
        <div className="min-h-screen bg-white pt-16">
          <div className="container mx-auto px-4 py-16">
            <Alert>
              <AlertDescription>
                Corso non trovato. Verifica che l'URL sia corretto.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${course.title} - Corso di Fotografia WeShoot`}
        description={`Scopri il corso ${course.title}. Impara la fotografia con i migliori coach WeShoot. Accesso immediato all'Accademia.`}
        url={`https://www.weshoot.it/corsi-di-fotografia/${course.slug}`}
        image={course.cover?.url}
      />
      <Header />
  
      <CourseDetailHero course={course} />

      {/* Course Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <CourseContent course={course} />
            </div>

            <div className="lg:col-span-1">
              <CourseInfoCard course={course} />
              <div className="mt-8">
                <CourseSidebar />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseTeacher course={course} />

      <CourseTeacherPhotos pictures={course.teacher?.pictures || []} />

      <CourseFAQ faqs={course.faqs || []} />

      <CourseDetailCTA course={course} />
      <Footer />
    </div>
  );
};

export default CourseDetail;
