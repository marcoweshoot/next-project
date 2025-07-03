'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';

interface CourseDetailCTAProps {
  course: Course;
}

const CourseDetailCTA: React.FC<CourseDetailCTAProps> = ({ course }) => {
  const handleEnrollClick = () => {
    if (course.url) {
      window.open(course.url, '_blank');
    }
  };

  return (
    <section className="py-16 bg-[#E25141] text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Inizia Oggi il Tuo Percorso Fotografico
        </h2>
        <p className="text-xl mb-8 text-white/90">
          Unisciti a migliaia di fotografi che hanno trasformato la loro passione in professione
        </p>
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="bg-white text-[#E25141] hover:bg-gray-50 font-semibold shadow-lg"
            onClick={handleEnrollClick}
            disabled={!course.url}
          >
            Iscriviti al Corso
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CourseDetailCTA;
