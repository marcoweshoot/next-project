import React from 'react';
import { Button } from '@/components/ui/button';

interface TourCardPricingProps {
  duration: number;
  hasFutureSessions: boolean;
  price: number;
  href: string; // rimane per prop drilling ma non usato internamente
}

const TourCardPricing: React.FC<TourCardPricingProps> = ({
  duration,
  hasFutureSessions,
  price,
}) => {
  const formattedPrice = price.toLocaleString('it-IT');

  return (
    <div className="flex items-end justify-between mt-auto">
      <div>
        <div className="text-gray-600 mb-1 text-sm">
          {duration} Giorni
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {hasFutureSessions ? (
            price > 0 ? (
              <>€{formattedPrice}</>
            ) : (
              <>Scopri</>
            )
          ) : (
            <span className="text-lg text-red-600 font-semibold">
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {hasFutureSessions && (
        <Button
          asChild
          className="px-4 py-2 text-xs uppercase tracking-wide flex-shrink-0"
        >
          <span>Vedi viaggio</span>
        </Button>
      )}
    </div>
  );
};

export default TourCardPricing;