// components/reviews/ReviewsEmptyState.tsx

import Link from 'next/link';

export default function ReviewsEmptyState() {
  return (
    <section className="text-center py-20">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Nessuna recensione disponibile
      </h2>
      <p className="text-gray-600 mb-8">
        Le recensioni dei nostri viaggi saranno presto disponibili.
      </p>
      <Link
        href="/viaggi-fotografici/"
        className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
      >
        Scopri tutti i viaggi
      </Link>
    </section>
  );
}
