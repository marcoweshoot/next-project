import React from 'react';
import NextImage from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';

interface CourseInfoCardProps {
  course: Course;
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({ course }) => {
  // Definiamo le righe di info in un array per evitare ripetizioni
  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: 'Livello:', value: <Badge variant="secondary">Tutti i livelli</Badge> },
    course.totalLessons
      ? { label: 'Lezioni:', value: course.totalLessons }
      : null,
    { label: 'Durata:', value: 'A tuo ritmo' },
    { label: 'Accesso:', value: 'Illimitato' },
    { label: 'Lingua:', value: 'Italiano' },
  ].filter(Boolean) as any[];

  return (
    <Card className="bg-white shadow-xl">
      {course.cover && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg relative">
          <NextImage
            src={course.cover.url}
            alt={course.cover.alternativeText || course.title}
            fill
            sizes="100%"
            className="object-cover"
            priority
          />
        </div>
      )}

      <CardContent className="p-8">
        {course.price != null && (
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              €{course.price}
            </div>
            <p className="text-gray-600">Accesso a vita</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {infoRows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-600">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Usando Button come <a> non serve JS extra */}
        {course.url ? (
          <a
            href={course.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mb-4 inline-flex items-center justify-center rounded-md bg-red-600 px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            style={{ pointerEvents: course.url ? 'auto' : 'none' }}
          >
            Iscriviti Ora
          </a>
        ) : (
          <Button className="w-full mb-4" size="lg" disabled>
            Iscriviti Ora
          </Button>
        )}

        <p className="text-sm text-gray-500 text-center">
          30 giorni di garanzia soddisfatti o rimborsati
        </p>
      </CardContent>
    </Card>
  );
};

export default CourseInfoCard;
