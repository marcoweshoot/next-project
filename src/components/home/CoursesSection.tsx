"use client"

import Link from "next/link";
import React from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { GET_COURSES } from '@/graphql/queries/courses';
import CourseCard from '@/components/CourseCard';
import { GraduationCap } from 'lucide-react';

const CoursesSection: React.FC<{
  children?: React.ReactNode;
}> = (
  {
    children
  }
) => {
  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { locale: 'it', limit: 3 }
  });

  if (error) {
    console.error('Error loading courses:', error);
  }

  const courses = data?.courses || [];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 text-sm font-medium border-0">
              <GraduationCap className="h-4 w-4 mr-2" />
              Formazione Professionale
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Prima di partire, impara con i 
            <span className="text-primary"> corsi di fotografia</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Impara da vincitori di contest internazionali e sviluppa il tuo stile fotografico 
            con i nostri video corsi professionali
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            // Loading skeleton
            ([...Array(3)].map((_, index) => (
              <div key={index} className="h-full">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <Skeleton className="h-56 w-full bg-gray-200" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3 bg-gray-200" />
                    <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
                    <Skeleton className="h-4 w-2/3 mb-4 bg-gray-200" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-4 w-16 bg-gray-200" />
                      <Skeleton className="h-4 w-20 bg-gray-200" />
                    </div>
                    <div className="text-center mb-4">
                      <Skeleton className="h-8 w-16 mx-auto bg-gray-200" />
                    </div>
                    <Skeleton className="h-12 w-full bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            )))
          ) : courses.length > 0 ? (
            courses.slice(0, 3).map((course: any) => (
              <div key={course.id} className="h-full">
                <CourseCard course={course} />
              </div>
            ))
          ) : (
            // Fallback quando non ci sono corsi
            (<div className="col-span-full text-center py-12">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4 text-lg font-medium">I corsi saranno presto disponibili</p>
                <p className="text-gray-500 text-sm">Stiamo preparando contenuti di alta qualità per te</p>
              </div>
            </div>)
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
            asChild
          >
            <Link href="/corsi-di-fotografia">
              Scopri Tutti i Corsi
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
