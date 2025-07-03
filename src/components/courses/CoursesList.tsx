
import React from 'react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';

interface CoursesListProps {
  courses: Course[];
}

const CoursesList: React.FC<CoursesListProps> = ({ courses }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            I Nostri Corsi
          </h2>
          <p className="text-lg text-gray-600">
            Scegli il corso più adatto al tuo livello e ai tuoi obiettivi
          </p>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              I nostri corsi saranno disponibili presto. Torna a trovarci!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesList;
