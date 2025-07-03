
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Course } from '@/types';

interface CourseDetailHeroProps {
  course: Course;
}

const CourseDetailHero: React.FC<CourseDetailHeroProps> = ({ course }) => {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-16">
      <div className="absolute inset-0 bg-black/50"></div>
      {course.image && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${course.image.url})` }}
        />
      )}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList className="text-white/80">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/80 hover:text-white">
                  WeShoot
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/corsi-di-fotografia" className="text-white/80 hover:text-white">
                  Corsi di Fotografia
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">
                  {course.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="lg:col-span-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {course.title}
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Diventa un fotografo professionista con il metodo WeShoot. 
            Accesso immediato all'Accademia e supporto della community.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center space-x-2 text-white">
              <BookOpen className="h-5 w-5" />
              <span>Accesso immediato</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Users className="h-5 w-5" />
              <span>Community esclusiva</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Award className="h-5 w-5" />
              <span>Certificato finale</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetailHero;
