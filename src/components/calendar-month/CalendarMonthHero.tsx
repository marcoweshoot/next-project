import Image from 'next/image';

type Props = { monthName: string; year: string };

const HERO_URL =
  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/hero-calendar.jpg';

export default function CalendarMonthHero({ monthName, year }: Props) {
  return (
    <section className="relative h-[60vh] md:h-[70vh] text-white overflow-hidden">
      {/* Img LCP (preload + fetchPriority) */}
      <Image
        src={HERO_URL}
        alt={`Viaggi fotografici ${monthName} ${year}`}
        fill
        priority
        fetchPriority="high"       // <— spinge il browser a metterla in coda alta
        sizes="100vw"
        className="object-cover object-center brightness-75"
      />
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 flex h-full items-center justify-center px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Viaggi Fotografici {monthName} {year}
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            Tutti i viaggi programmati per {monthName} {year}
          </p>
        </div>
      </div>
    </section>
  );
}
