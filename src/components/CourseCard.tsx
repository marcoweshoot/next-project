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
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={coverUrl}
          alt={`Copertina del corso: ${course.title}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute right-4 top-4">
          <Badge className="bg-primary text-primary-foreground shadow-lg">Video Corso</Badge>
        </div>
      </div>

      <CardContent className="flex-1 p-6">
        <h3 className="mb-4 line-clamp-2 text-xl font-bold leading-tight text-foreground">
          {course.title}
        </h3>

        {course.excerpt && (
          <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{course.excerpt}</p>
        )}

        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
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

        <div className="mb-4 flex items-center gap-3 border-b pb-4">
          <Image
            src={teacherImage}
            alt={`Foto di ${course.teacher?.firstName || 'Istruttore'}`}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              {course.teacher?.firstName || 'Istruttore'}
            </p>
            <p className="text-xs text-muted-foreground">Istruttore</p>
          </div>
        </div>

        {course.price && (
          <div className="mb-6 text-center">
            <div className="mb-1 text-3xl font-bold text-primary">€{course.price}</div>
            <p className="text-sm text-muted-foreground">Prezzo unico</p>
          </div>
        )}

        {children && <div className="mt-4">{children}</div>}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/corsi-di-fotografia/${course.slug}`} className="w-full">
          <Button
            variant="default"
            className="w-full py-3 font-semibold shadow-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Scopri il Corso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
