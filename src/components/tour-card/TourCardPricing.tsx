
import React from 'react';
import { Button } from '@/components/ui/button';

interface TourCardPricingProps {
  duration: number;
  hasFutureSessions: boolean;
  price: number;
}

const TourCardPricing: React.FC<TourCardPricingProps> = ({
  duration,
  hasFutureSessions,
  price
}) => {
  console.log('TourCardPricing - hasFutureSessions:', hasFutureSessions, 'price:', price);
  
  return (
    <div className="flex items-end justify-between mt-auto">
      <div>
        <div className="text-gray-600 mb-1 text-sm">
          {duration} Giorni
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {hasFutureSessions ? (
            price > 0 ? (
              <>€{price.toLocaleString()}</>
            ) : (
              <>Scopri</>
            )
          ) : (
            <span className="text-lg text-orange-600 font-semibold">Coming Soon</span>
          )}
        </div>
      </div>

      <Button 
        className="px-4 py-2 text-xs uppercase tracking-wide flex-shrink-0"
      >
        VEDI VIAGGIO
      </Button>
    </div>
  );
};

export default TourCardPricing;
