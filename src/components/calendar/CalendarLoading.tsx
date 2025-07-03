import PageHeader from '@/components/PageHeader';

interface CalendarLoadingProps {
  coverImage?: string; // immagine dinamica passata come prop
}

const CalendarMonthSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 h-16 rounded-t-lg mb-4" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-20 rounded" />
      ))}
    </div>
  </div>
);

const CalendarLoading = ({
  coverImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
}: CalendarLoadingProps) => {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true">
      <PageHeader backgroundImage={coverImage}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tutte le date dei viaggi fotografici
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Pulisci le lenti, carica le batterie, svuota le schede e preparati a riempirle di emozioni.
          </p>
        </div>
      </PageHeader>

      <section className="py-8 bg-gray-50" aria-label="Calendario in caricamento">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {[...Array(3)].map((_, i) => (
            <CalendarMonthSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CalendarLoading;
