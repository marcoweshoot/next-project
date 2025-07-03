
import React from 'react';
import { Course } from '@/types';

interface CourseContentProps {
  course: Course;
}

const CourseContent: React.FC<CourseContentProps> = ({ course }) => {
  // Se non c'è presentation, mostra un messaggio di fallback
  if (!course.presentation) {
    return (
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600">Contenuto del corso in caricamento...</p>
      </div>
    );
  }

  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: course.presentation }}
    />
  );
};

export default CourseContent;
