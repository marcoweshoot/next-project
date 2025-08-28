import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Coach {
  id: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: {
    url?: string;
    alternativeText?: string;
  };
}

interface TourCardCoachesProps {
  sessionCoaches: Coach[];
}

const TourCardCoaches: React.FC<TourCardCoachesProps> = ({ sessionCoaches }) => {
  if (!sessionCoaches || sessionCoaches.length === 0) return null;

  const getCoachFullName = (coach: Coach) => {
    return [coach.firstName, coach.lastName].filter(Boolean).join(' ').trim();
  };

  return (
    <div className="flex items-center space-x-3 mb-6 h-12">
      <div className="flex -space-x-2">
        {sessionCoaches.slice(0, 3).map((coach, index) => {
          const imageUrl = coach.profilePicture?.url;
          const altText = coach.profilePicture?.alternativeText || getCoachFullName(coach);
          const initials = coach.firstName?.[0] || '?';

          return (
            <Avatar key={coach.id || index} className="w-10 h-10 border-2 border-white flex-shrink-0">
              <AvatarImage
                src={imageUrl}
                alt={altText}
              />
              <AvatarFallback className="bg-gray-300 text-gray-700 font-medium text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {sessionCoaches.length > 3 && (
          <Avatar className="w-10 h-10 border-2 border-white flex-shrink-0">
            <AvatarFallback className="bg-gray-300 text-gray-700 font-medium text-xs">
              +{sessionCoaches.length - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {sessionCoaches.map(getCoachFullName).filter(Boolean).join(', ') || 'Coach WeShoot'}
        </p>
      </div>
    </div>
  );
};

export default TourCardCoaches;
