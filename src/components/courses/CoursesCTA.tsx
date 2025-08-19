// components/courses/CoursesCTA.tsx
import React from 'react';
import Link from 'next/link';

const CoursesCTA: React.FC = () => {
  return (
    <section className="py-16 text-grey-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto a Iniziare il Tuo Viaggio Fotografico?
        </h2>
        <p className="text-xl mb-8 text-gray-700">
          Unisciti a migliaia di fotografi che hanno trasformato la loro passione in professione
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://accademia.weshoot.it/wp-login"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Accedi all'Accademia
          </a>

          <Link
            href="/viaggi-fotografici"
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Scopri i Viaggi
          </Link>
        </div>
      </div>
    </section>
  );
};

export default React.memo(CoursesCTA);
