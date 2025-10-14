import Link from "next/link";
import { FC } from "react";
import { Button } from "@/components/ui/button";
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
      className="py-20 bg-background bg-gradient-to-br from-muted/60 to-background"
      aria-labelledby="courses-section-title"
    >
      <div className="container">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2
            id="courses-section-title"
            className="mb-6 text-4xl font-bold text-foreground md:text-5xl"
          >
            Prima di partire, impara con i{" "}
            <span className="text-primary">corsi di fotografia</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
            Impara da vincitori di contest internazionali e sviluppa il tuo
            stile fotografico con i nostri video corsi professionali.
          </p>
        </div>

        {/* Courses */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.length > 0 ? (
            courses.map((course) => <CourseCard key={course.id} course={course} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
                <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium text-foreground">
                  I corsi saranno presto disponibili
                </p>
                <p className="text-sm text-muted-foreground">
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
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background font-semibold"
          >
            <Link href="/corsi-di-fotografia">Scopri Tutti i Corsi</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
