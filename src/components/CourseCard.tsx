'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';
import { BookOpen, Clock, Users } from 'lucide-react';
import { FALLBACKS } from '@/constants/fallbacks';

interface CourseCardProps {
  course: Course;
  children?: React.ReactNode;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, children }) => {
  const coverUrl = course.cover?.url || FALLBACKS.COURSE_COVER;
  const teacherImage = course.teacher?.profilePicture?.url || FALLBACKS.TEACHER_AVATAR;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white border-0 shadow-lg">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={coverUrl}
          alt={`Copertina del corso: ${course.title}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 right-4">
          <Badge className="bg-red-600 text-white shadow-lg">Video Corso</Badge>
        </div>
      </div>

      <CardContent className="flex-1 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
          {course.title}
        </h3>

        {course.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.excerpt}</p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          {course.totalLessons && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.totalLessons} lezioni</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Accesso a vita</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Tutti i livelli</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <Image
            src={teacherImage}
            alt={`Foto di ${course.teacher?.firstName || 'Istruttore'}`}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {course.teacher?.firstName || 'Istruttore'}
            </p>
            <p className="text-xs text-gray-500">Istruttore</p>
          </div>
        </div>

        {course.price && (
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-red-600 mb-1">€{course.price}</div>
            <p className="text-sm text-gray-500">Prezzo unico</p>
          </div>
        )}

        {children && <div className="mt-4">{children}</div>}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/corsi-di-fotografia/${course.slug}`} className="w-full">
          <Button className="w-full bg-red-600 hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
            Scopri il Corso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
