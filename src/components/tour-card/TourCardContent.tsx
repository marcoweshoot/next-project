
import React from 'react';
import TourCardCoaches from './TourCardCoaches';
import TourCardPricing from './TourCardPricing';

interface TourCardContentProps {
  title: string;
  sessionCoaches: any[];
  mainCoach: {
    name: string;
    avatar?: {
      url: string;
      alt?: string;
    };
  };
  duration: number;
  hasFutureSessions: boolean;
  price: number;
  href: string;
}

const TourCardContent: React.FC<TourCardContentProps> = ({
  title,
  sessionCoaches,
  mainCoach,
  duration,
  hasFutureSessions,
  price,
  href
}) => {
  return (
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight h-14 overflow-hidden line-clamp-2">
        {title}
      </h3>

      <TourCardCoaches 
       sessionCoaches={sessionCoaches}
      />


      <TourCardPricing 
        duration={duration}
        hasFutureSessions={hasFutureSessions}
        price={price}
        href={href}
      />
    </div>
  );
};

export default TourCardContent;
