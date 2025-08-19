import React from "react";

interface ToursSectionHeaderProps {
  title?: string;
  subtitle?: string;
}

const ToursSectionHeader: React.FC<ToursSectionHeaderProps> = ({
  title = "Viaggi Fotografici in Evidenza",
  subtitle = "Esplora le nostre destinazioni più popolari con i migliori coach fotografici professionali",
}) => {
  return (
    <header className="text-center mb-12 px-4" aria-labelledby="tours-heading">
      <h2
        id="tours-heading"
        className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4"
      >
        {title}
      </h2>

      <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </header>
  );
};

export default ToursSectionHeader;
