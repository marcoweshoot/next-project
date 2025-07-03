
import React from 'react';

const ReviewsError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Errore nel caricamento delle recensioni
          </h1>
          <p className="text-gray-600">
            Si è verificato un errore durante il caricamento. Riprova più tardi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewsError;
