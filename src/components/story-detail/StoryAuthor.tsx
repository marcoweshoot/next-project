
import React from 'react';
import { Instagram } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StoryAuthorProps {
  photographer: {
    firstName: string;
    lastName?: string;
    instagram?: string;
    profilePicture?: {
      url: string;
      alternativeText?: string;
    };
  };
}

const StoryAuthor: React.FC<StoryAuthorProps> = ({ photographer }) => {
  const fullName = `${photographer.firstName} ${photographer.lastName || ''}`.trim();
  const initials = photographer.firstName.charAt(0) + (photographer.lastName?.charAt(0) || '');

  return (
    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg">
      <Avatar className="h-16 w-16">
        <AvatarImage 
          src={photographer.profilePicture?.url} 
          alt={photographer.profilePicture?.alternativeText || fullName}
        />
        <AvatarFallback className="text-lg font-semibold bg-[#E25141] text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
        <p className="text-gray-600">Fotografo WeShoot</p>
        {photographer.instagram && (
          <a 
            href={`https://instagram.com/${photographer.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-[#E25141] hover:text-red-600 transition-colors mt-2"
          >
            <Instagram className="h-4 w-4" />
            <span>@{photographer.instagram}</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default StoryAuthor;
