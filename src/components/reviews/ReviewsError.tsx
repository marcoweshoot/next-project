// components/reviews/ReviewsError.tsx

export default function ReviewsError() {
  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Errore nel caricamento delle recensioni
        </h1>
        <p className="text-gray-600">
          Si è verificato un errore durante il caricamento. Ti invitiamo a riprovare più tardi.
        </p>
      </div>
    </section>
  );
}
