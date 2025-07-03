
import Link from "next/link";
import React from 'react';

interface DestinationDetailEmptyStateProps {
  destinationName?: string;
}

const DestinationDetailEmptyState: React.FC<{
  children?: React.ReactNode;
}> = ({
  destinationName,
  children
}) => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Contenuti in arrivo
        </h2>
        <p className="text-gray-600 mb-8">
          I viaggi fotografici per {destinationName} saranno presto disponibili.
        </p>
        <Link 
          href="/viaggi-fotografici/" 
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Scopri tutti i nostri viaggi fotografici
        </Link>
      </div>
    </section>
  );
};

export default DestinationDetailEmptyState;
