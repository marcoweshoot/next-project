import React from "react";
import ToursServerContent from "./tours/ToursServerContent";
import { Tour } from "@/types";

interface HomePageTours {
  id: string;
  title: string;
  subtitle: string;
  tours: Tour[]; // <-- già trasformati!
}

interface ToursSectionProps {
  homePageTours: HomePageTours;
}

const ToursSection: React.FC<ToursSectionProps> = ({ homePageTours }) => {
  const transformedTours: Tour[] = homePageTours?.tours || [];

  return (
    <section
      className="py-16 bg-gray-50 dark:bg-background transition-colors"
      aria-label="Viaggi fotografici in evidenza"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToursServerContent
          title={homePageTours?.title || "Viaggi in evidenza"}
          subtitle={homePageTours?.subtitle || "Le prossime partenze da non perdere"}
          tours={transformedTours}
        />
      </div>
    </section>
  );
};

export default ToursSection;
