
import React from 'react';

interface ToursSectionHeaderProps {
  title?: string;
  subtitle?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ToursSectionHeader: React.FC<ToursSectionHeaderProps> = ({
  title = "Viaggi Fotografici in Evidenza",
  subtitle = "Esplora le nostre destinazioni più popolari con i migliori coach fotografici professionali",
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        {subtitle}
      </p>
    </div>
  );
};

export default ToursSectionHeader;
