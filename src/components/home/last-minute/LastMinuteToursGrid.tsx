import React from "react";
import TourCard from "@/components/tour-card/TourCard";
import type { Tour } from "@/types/tour";

interface Props {
  tours: Tour[];
}

const LastMinuteToursGrid: React.FC<Props> = ({ tours }) => {
  if (!tours?.length) return null;

  return (
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
      aria-label="Griglia viaggi last minute"
    >
      {tours.map((tour, index) => (
        <li
          key={tour.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <TourCard tour={tour} />
        </li>
      ))}
    </ul>
  );
};

export default LastMinuteToursGrid;
