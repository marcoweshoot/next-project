import React from 'react';
import { DestinationDetailToursProps } from './types';
import { filterToursByDestination } from './tourFilters';
import DestinationToursGrid from './DestinationToursGrid';
import DestinationToursLoading from './DestinationToursLoading';

const DestinationDetailTours: React.FC<DestinationDetailToursProps> = ({
  tours,
  destination,
  loading
}) => {
  const filteredTours = filterToursByDestination(tours, destination);

  if (filteredTours.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Viaggi Fotografici in {destination?.name}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Partecipa ai nostri viaggi fotografici e scopri {destination?.name} insieme ai nostri coach esperti
          </p>
        </div>

        {loading ? (
          <DestinationToursLoading />
        ) : (
          <DestinationToursGrid tours={filteredTours} destination={destination} />
        )}

        {!loading && filteredTours.length === 0 && tours.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Al momento non ci sono viaggi fotografici programmati per {destination?.name}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinationDetailTours;
