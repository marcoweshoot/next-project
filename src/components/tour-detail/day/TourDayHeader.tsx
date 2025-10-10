import React from 'react';
import { Clock } from 'lucide-react';

type Variant = 'ribbon' | 'bar' | 'stripe';

interface TourDayHeaderProps {
  number: number | string; // Può essere un numero singolo o una stringa come "6-7-8-9-10"
  title?: string;
  variant?: Variant;
  /** livello heading del titolo del giorno (default: 2 => <h2>) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

const TourDayHeader: React.FC<TourDayHeaderProps> = ({
  number,
  title,
  variant = 'bar',
  headingLevel = 2,
}) => {
  const H = (`h${headingLevel}` as keyof JSX.IntrinsicElements);
  const headingId = `day-heading-${number}`;

  return (
    <header
      className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-zinc-900/60 backdrop-blur-md ring-1 ring-zinc-200/70 dark:ring-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.06)] p-6 md:p-8"
      aria-labelledby={headingId}
    >
      {/* DECORAZIONI VARIANTI */}
      {variant === 'ribbon' && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-10 h-28 w-[140%] -rotate-6 rounded-[999px] bg-gradient-to-r from-primary/25 via-fuchsia-500/15 to-emerald-400/25 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        </>
      )}
      {variant === 'bar' && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-rose-500 to-amber-400" />
      )}
      {variant === 'stripe' && (
        <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b from-primary to-orange-400" />
      )}

      {/* CONTENUTO */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-300">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>
            {typeof number === 'string' && number.includes('-') 
              ? `Giorni ${number}` 
              : `Giorno ${number}`}
          </span>
        </div>

        {React.createElement(
          H,
          { id: headingId, className: 'text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50' },
          title || 'Giornata del tour'
        )}
      </div>
    </header>
  );
};

export default TourDayHeader;
