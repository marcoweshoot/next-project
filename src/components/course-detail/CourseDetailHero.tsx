import React from 'react';
import NextImage from 'next/image';
import { BookOpen, Users, Award } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Course } from '@/types';

interface CourseDetailHeroProps {
  course: Course & { image?: { url: string; alternativeText?: string } };
}

const CourseDetailHero: React.FC<CourseDetailHeroProps> = ({ course }) => {
  const img = course.image;

  return (
    <section className="relative w-full h-[60vh] md:h-[70vh]">
      {/* Background + Overlay */}
      {img?.url && (
        <div className="absolute inset-0">
          <NextImage
            src={img.url}
            alt={img.alternativeText || course.title}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/50" />
        </div>
      )}

      {/* Content centered */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-4 text-center text-white max-w-4xl mx-auto">
        <Breadcrumb aria-label="Breadcrumb" className="mb-6">
          <BreadcrumbList className="text-white/80">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hover:text-white">
                WeShoot
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator aria-hidden="true" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/corsi-di-fotografia"
                className="hover:text-white"
              >
                Corsi di Fotografia
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator aria-hidden="true" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">
                {course.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl md:text-5xl font-bold mb-4">{course.title}</h1>
        <p className="text-lg md:text-xl mb-8">
          Diventa un fotografo professionista con il metodo WeShoot. Accesso
          immediato all'Accademia e supporto della community.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-white">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Accesso immediato</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Community esclusiva</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Certificato finale</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetailHero;
