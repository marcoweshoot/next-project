
import React from 'react';

interface TourDayContentProps {
  description?: string;
}

const TourDayContent: React.FC<TourDayContentProps> = ({ description }) => {
  if (!description) return null;

  return (
    <div className="mb-8">
      <div 
        className="text-gray-700 leading-relaxed prose max-w-none text-lg"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};

export default TourDayContent;
