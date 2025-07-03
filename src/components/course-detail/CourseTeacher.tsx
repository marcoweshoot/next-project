
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Instagram } from 'lucide-react';
import { Course } from '@/types';

interface CourseTeacherProps {
  course: Course;
}

const CourseTeacher: React.FC<CourseTeacherProps> = ({ course }) => {
  if (!course.teacher) {
    return null;
  }

  const { teacher } = course;
  const fullName = `${teacher.firstName}${teacher.lastName ? ` ${teacher.lastName}` : ''}`;
  const initials = `${teacher.firstName.charAt(0)}${teacher.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Il Tuo Insegnante
        </h2>
        
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Teacher Photo */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  {teacher.profilePicture?.url ? (
                    <AvatarImage 
                      src={teacher.profilePicture.url} 
                      alt={teacher.profilePicture.alternativeText || fullName}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              {/* Teacher Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {fullName}
                  </h3>
                  
                  {teacher.instagram && (
                    <a
                      href={`https://www.instagram.com/${teacher.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 mx-auto md:mx-0"
                      title={`Segui ${fullName} su Instagram`}
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
                
                {teacher.bio && (
                  <div 
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: teacher.bio }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CourseTeacher;
