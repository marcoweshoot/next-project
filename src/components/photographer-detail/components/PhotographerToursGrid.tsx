import React from "react";
import TourCard from "@/components/TourCard";
import { Tour } from "@/types";

interface PhotographerToursGridProps {
  tours: Tour[];
}

const PhotographerToursGrid: React.FC<PhotographerToursGridProps> = ({ tours }) => {
  return (
    <section className="py-16 bg-muted">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Parti in viaggio con me
          </h2>
          <p className="text-xl text-muted-foreground">
            Questi sono i viaggi fotografici dove ti farò da coach
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotographerToursGrid;
