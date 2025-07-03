
import Link from "next/link";
import React from 'react';

interface LocationErrorProps {
  stateSlug: string;
  type: 'error' | 'not-found';
}

const LocationError: React.FC<{
  children?: React.ReactNode;
}> = ({
  stateSlug,
  type,
  children
}) => {
  const isError = type === 'error';
  
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {isError ? 'Errore nel caricamento della location' : 'Location non trovata'}
      </h3>
      <p className="text-gray-600 mb-8">
        {isError 
          ? 'Si è verificato un errore durante il caricamento. Riprova più tardi.'
          : 'La location richiesta non è stata trovata.'
        }
      </p>
      <Link 
        href={`/viaggi-fotografici/destinazioni/${stateSlug}/`}
        className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Torna alla destinazione
      </Link>
    </div>
  );
};

export default LocationError;
