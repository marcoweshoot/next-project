import React from 'react';
import { Button } from '@/components/ui/button';

interface TourCardPricingProps {
  duration: number;
  hasFutureSessions: boolean;
  price: number;
  href: string; // mantenuto per compatibilità, non usato qui
}

const TourCardPricing: React.FC<TourCardPricingProps> = ({
  duration,
  hasFutureSessions,
  price,
}) => {
  const formattedPrice = price.toLocaleString('it-IT');

  return (
    <div className="mt-auto flex items-end justify-between">
      <div>
        <div className="mb-1 text-sm text-muted-foreground">
          {duration} Giorni
        </div>

        <div className="text-2xl font-extrabold text-foreground sm:text-3xl">
          {hasFutureSessions ? (
            price > 0 ? (
              <>€{formattedPrice}</>
            ) : (
              <>Scopri</>
            )
          ) : (
            <span className="text-base font-semibold text-primary">
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {hasFutureSessions && (
        <Button
          asChild
          className="flex-shrink-0 px-4 py-2 text-xs uppercase tracking-wide font-semibold"
        >
          <span>Vedi viaggio</span>
        </Button>
      )}
    </div>
  );
};

export default TourCardPricing;
