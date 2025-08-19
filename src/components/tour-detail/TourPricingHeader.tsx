'use client';

import React from 'react';
import { Clock, Users, AlertTriangle } from 'lucide-react';

interface TourPricingHeaderProps {
  price?: number;
  deposit?: number;
  nextSession?: {
    start: string;
    end: string;
    maxPax?: number;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  hasAvailableSessions?: boolean;
}

const TourPricingHeader: React.FC<TourPricingHeaderProps> = ({
  price,
  deposit,
  nextSession,
  difficulty,
  hasAvailableSessions = true,
}) => {
  const formatCurrency = (value: number | undefined) =>
    typeof value === 'number'
      ? new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
        }).format(value)
      : '—';

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const getDurationDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDifficultyLabel = (value: string | undefined) => {
    switch (value) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Intermedio';
      case 'hard':
        return 'Difficile';
      default:
        return '—';
    }
  };

  return (
    <header
      className="bg-white text-gray-900 p-4 md:p-6 rounded-t-lg border-b border-gray-200"
      aria-label="Informazioni sul prezzo"
    >
      <div className="text-center mb-4">
        <p className="text-xs md:text-sm uppercase tracking-wide text-gray-600 mb-1">
          {hasAvailableSessions ? 'Prezzo del viaggio' : 'Prossime partenze'}
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {hasAvailableSessions ? formatCurrency(price) : 'In arrivo'}
        </p>
        {hasAvailableSessions && (
          <p className="text-sm text-gray-600">per persona</p>
        )}
      </div>

      {hasAvailableSessions && deposit && deposit > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Acconto richiesto:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(deposit)}</span>
          </div>
        </div>
      )}

      {hasAvailableSessions && nextSession?.start && (
        <div className="border-t border-gray-200 pt-4">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-1">
              Prima partenza disponibile
            </p>
            <p className="font-semibold text-gray-900 text-sm md:text-base">
              {formatDate(nextSession.start)}
            </p>
          </div>
        </div>
      )}

      {/* Durata, max partecipanti, difficoltà */}
      <div className="grid grid-cols-3 text-center mt-6 text-sm text-gray-600">
        <div>
          <Clock className="mx-auto w-5 h-5 text-gray-400 mb-1" />
          <strong className="block text-lg text-gray-900">
            {nextSession?.start && nextSession?.end
              ? `${getDurationDays(nextSession.start, nextSession.end)}`
              : '—'}
          </strong>
          giorni
        </div>
        <div>
          <Users className="mx-auto w-5 h-5 text-gray-400 mb-1" />
          <strong className="block text-lg text-gray-900">
            {nextSession?.maxPax ?? '—'}
          </strong>
          max partecipanti
        </div>
        <div>
          <AlertTriangle className="mx-auto w-5 h-5 text-gray-400 mb-1" />
          <strong className="block text-lg text-gray-900">
            {getDifficultyLabel(difficulty)}
          </strong>
          difficoltà
        </div>
      </div>
    </header>
  );
};

export default TourPricingHeader;
