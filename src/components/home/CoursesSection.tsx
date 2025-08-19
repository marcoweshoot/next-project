import Link from "next/link";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import CourseCard from "@/components/CourseCard";

interface Course {
  id: string;
  title: string;
  slug: string;
  // altri campi usati da CourseCard
}

interface CoursesSectionProps {
  courses: Course[];
}

const CoursesSection: FC<CoursesSectionProps> = ({ courses }) => {
  return (
    <section
      className="py-20 bg-gradient-to-br from-gray-50 to-white"
      aria-labelledby="courses-section-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
          </div>
          <h2
            id="courses-section-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Prima di partire, impara con i {" "}
            <span className="text-primary">corsi di fotografia</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Impara da vincitori di contest internazionali e sviluppa il tuo
            stile fotografico con i nostri video corsi professionali.
          </p>
        </div>

        {/* Courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 text-lg font-medium">
                  I corsi saranno presto disponibili
                </p>
                <p className="text-gray-500 text-sm">
                  Stiamo preparando contenuti di alta qualità per te.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200"
            asChild
          >
            <Link href="/corsi-di-fotografia">Scopri Tutti i Corsi</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
