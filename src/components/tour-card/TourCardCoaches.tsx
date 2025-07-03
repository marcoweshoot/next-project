
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface TourCardCoachesProps {
  sessionCoaches: any[];
  mainCoach: {
    name: string;
    avatar?: {
      url: string;
      alt?: string;
    };
  };
}

const TourCardCoaches: React.FC<TourCardCoachesProps> = ({
  sessionCoaches,
  mainCoach
}) => {
  const displayCoaches = sessionCoaches.length > 0 ? sessionCoaches : [mainCoach];

  const getCoachNames = () => {
    if (sessionCoaches.length > 0) {
      return sessionCoaches.map((user, index) => {
        const name = user.firstName || user.username;
        return index === sessionCoaches.length - 1 ? name : `${name}, `;
      }).join('');
    }
    return mainCoach.name;
  };

  return (
    <div className="flex items-center space-x-3 mb-6 h-12">
      <div className="flex -space-x-2">
        {displayCoaches.slice(0, 3).map((coach, index) => {
          const avatarUrl = sessionCoaches.length > 0 
            ? coach.profilePicture?.url 
            : mainCoach.avatar?.url;
          const coachName = sessionCoaches.length > 0 
            ? coach.firstName || coach.username 
            : mainCoach.name;
          
          return (
            <Avatar key={index} className="w-10 h-10 border-2 border-white flex-shrink-0">
              <AvatarImage
                src={avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'}
                alt={coachName}
              />
              <AvatarFallback className="bg-gray-300 text-gray-700 font-medium text-xs">
                {coachName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {displayCoaches.length > 3 && (
          <Avatar className="w-10 h-10 border-2 border-white flex-shrink-0">
            <AvatarFallback className="bg-gray-300 text-gray-700 font-medium text-xs">
              +{displayCoaches.length - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getCoachNames()}
        </p>
      </div>
    </div>
  );
};

export default TourCardCoaches;
