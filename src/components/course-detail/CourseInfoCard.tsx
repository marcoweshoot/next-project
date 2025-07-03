'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';

interface CourseInfoCardProps {
  course: Course;
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({ course }) => {
  const handleEnrollClick = () => {
    if (course.url) {
      window.open(course.url, '_blank');
    }
  };

  return (
    <Card className="bg-white shadow-xl">
      {course.cover && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={course.cover.url} 
            alt={course.cover.alternativeText || course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-8">
        {course.price && (
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              €{course.price}
            </div>
            <p className="text-gray-600">Accesso a vita</p>
          </div>
        )}
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Livello:</span>
            <Badge variant="secondary">Tutti i livelli</Badge>
          </div>
          {course.totalLessons && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lezioni:</span>
              <span className="font-medium">{course.totalLessons}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Durata:</span>
            <span className="font-medium">A tuo ritmo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Accesso:</span>
            <span className="font-medium">Illimitato</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Lingua:</span>
            <span className="font-medium">Italiano</span>
          </div>
        </div>

        <Button 
          className="w-full mb-4" 
          size="lg"
          onClick={handleEnrollClick}
          disabled={!course.url}
        >
          Iscriviti Ora
        </Button>
        
        <p className="text-sm text-gray-500 text-center">
          30 giorni di garanzia soddisfatti o rimborsati
        </p>
      </CardContent>
    </Card>
  );
};

export default CourseInfoCard;
