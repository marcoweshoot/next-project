
import React from 'react';

interface TourDetailsGridProps {
  duration: number;
  maxParticipants: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const TourDetailsGrid: React.FC<TourDetailsGridProps> = ({ 
  duration, 
  maxParticipants, 
  difficulty 
}) => {
  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return {
          text: 'Facile',
          color: 'text-green-600'
        };
      case 'medium':
        return {
          text: 'Intermedio',
          color: 'text-yellow-600'
        };
      case 'hard':
        return {
          text: 'Difficile',
          color: 'text-red-600'
        };
      default:
        return {
          text: 'Intermedio',
          color: 'text-yellow-600'
        };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty || 'medium');

  return (
    <div className="p-4 md:p-6 border-b">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-gray-900">{duration}</div>
          <div className="text-xs md:text-sm text-gray-600">giorni durata</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-gray-900">{maxParticipants}</div>
          <div className="text-xs md:text-sm text-gray-600">max partecipanti</div>
        </div>
        <div className="text-center">
          <div className={`text-base md:text-lg font-bold ${difficultyInfo.color}`}>{difficultyInfo.text}</div>
          <div className="text-xs md:text-sm text-gray-600">difficoltà</div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailsGrid;
