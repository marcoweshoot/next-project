import ToursSectionHeader from "./ToursSectionHeader";
import ToursGrid from "./ToursGrid";
import ToursSectionFooter from "./ToursSectionFooter";
import { Tour } from "@/types";

interface ToursServerContentProps {
  title: string;
  subtitle: string;
  tours: Tour[];
}

const ToursServerContent = ({
  title,
  subtitle,
  tours,
}: ToursServerContentProps) => {
  const visibleTours = tours.slice(0, 6); // oppure gestiscilo lato server

  return (
    <>
      <ToursSectionHeader title={title} subtitle={subtitle} />
      <ToursGrid tours={visibleTours} loading={false} />
      <ToursSectionFooter />
    </>
  );
};

export default ToursServerContent;
