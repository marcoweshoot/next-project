
import React from 'react';

interface PhotographerToursEmptyProps {
  photographerName: string;
}

const PhotographerToursEmpty: React.FC<PhotographerToursEmptyProps> = ({ 
  photographerName 
}) => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Parti in viaggio con me
          </h2>
          <p className="text-xl text-gray-600">
            Al momento non ci sono viaggi disponibili con {photographerName}.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PhotographerToursEmpty;
