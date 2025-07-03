
import React from 'react';
import { getDifficultyBadge } from './tourCardUtils';

interface TourCardImageProps {
  coverUrl?: string;
  coverAlt?: string;
  title: string;
  difficulty?: string;
}

const TourCardImage: React.FC<TourCardImageProps> = ({
  coverUrl,
  coverAlt,
  title,
  difficulty = 'medium'
}) => {
  const difficultyBadge = getDifficultyBadge(difficulty);

  return (
    <div className="relative overflow-hidden h-48 flex-shrink-0">
      <img
        src={coverUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
        alt={coverAlt || title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyBadge.className}`}>
          {difficultyBadge.text}
        </span>
      </div>
    </div>
  );
};

export default TourCardImage;
