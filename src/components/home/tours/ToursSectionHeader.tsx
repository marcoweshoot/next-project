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
    <header className="mb-12 px-4 text-center" aria-labelledby="tours-heading">
      <h2
        id="tours-heading"
        className="mb-4 text-3xl font-extrabold text-foreground sm:text-4xl text-balance"
      >
        {title}
      </h2>

      <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
        {subtitle}
      </p>
    </header>
  );
};

export default ToursSectionHeader;
