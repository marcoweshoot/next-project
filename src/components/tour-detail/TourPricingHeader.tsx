
import React from 'react';

interface TourPricingHeaderProps {
  price: number;
  deposit?: number;
  nextSession?: {
    start: string;
    end: string;
  };
  hasAvailableSessions?: boolean;
}

const TourPricingHeader: React.FC<TourPricingHeaderProps> = ({ 
  price, 
  deposit, 
  nextSession,
  hasAvailableSessions = true
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white text-gray-900 p-4 md:p-6 rounded-t-lg border-b border-gray-200">
      <div className="text-center mb-4">
        <div className="text-xs md:text-sm uppercase tracking-wide text-gray-600 mb-1">
          {hasAvailableSessions ? "Prezzo del viaggio" : "Prossime partenze"}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">
          {hasAvailableSessions ? `€${price?.toLocaleString()}` : "Coming Soon"}
        </div>
        {hasAvailableSessions && (
          <div className="text-xs md:text-sm text-gray-600">per persona</div>
        )}
      </div>
      
      {hasAvailableSessions && deposit && deposit > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Acconto richiesto:</span>
            <span className="font-semibold text-gray-900">€{deposit?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {hasAvailableSessions && nextSession && (
        <div className="border-t border-gray-200 pt-4">
          <div className="text-center">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Prima partenza disponibile</div>
            <div className="font-semibold text-gray-900 text-sm md:text-base">{formatDate(nextSession.start)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPricingHeader;
