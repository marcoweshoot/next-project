import React from 'react';
import { Clock, Users, AlertTriangle } from 'lucide-react';

interface TourDetailsGridProps {
  duration: number;
  maxParticipants: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const TourDetailsGrid: React.FC<TourDetailsGridProps> = ({
  duration,
  maxParticipants,
  difficulty = 'medium',
}) => {
  const getDifficultyInfo = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return { text: 'Facile', color: 'text-green-600' };
      case 'medium':
        return { text: 'Intermedio', color: 'text-yellow-600' };
      case 'hard':
        return { text: 'Difficile', color: 'text-red-600' };
      default:
        return { text: 'Intermedio', color: 'text-yellow-600' };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  return (
    <div className="p-4 md:p-6 border-b">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {/* Durata */}
        <div aria-label="Durata del viaggio">
          <Clock className="w-5 h-5 mx-auto text-gray-500 mb-1" />
          <div className="text-xl md:text-2xl font-bold text-gray-900">{duration}</div>
          <div className="text-sm text-gray-600">giorni</div>
        </div>

        {/* Max partecipanti */}
        <div aria-label="Numero massimo partecipanti">
          <Users className="w-5 h-5 mx-auto text-gray-500 mb-1" />
          <div className="text-xl md:text-2xl font-bold text-gray-900">{maxParticipants}</div>
          <div className="text-sm text-gray-600">max partecipanti</div>
        </div>

        {/* Difficoltà */}
        <div aria-label="Livello di difficoltà">
          <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-gray-500" />
          <div className={`text-base md:text-lg font-bold ${difficultyInfo.color}`}>
            {difficultyInfo.text}
          </div>
          <div className="text-sm text-gray-600">difficoltà</div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailsGrid;
