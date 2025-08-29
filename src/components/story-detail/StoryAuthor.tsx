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
  const initials =
    photographer.firstName.charAt(0) +
    (photographer.lastName?.charAt(0) || '');

  return (
    <div className="flex items-center space-x-4 p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <Avatar className="h-16 w-16 ring-2 ring-border">
        <AvatarImage
          src={photographer.profilePicture?.url}
          alt={
            photographer.profilePicture?.alternativeText
              ? photographer.profilePicture.alternativeText
              : `Foto del fotografo ${fullName}`
          }
        />
        <AvatarFallback
          className="text-lg font-semibold bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-foreground">{fullName}</h3>
        <p className="text-muted-foreground">Fotografo WeShoot</p>

        {photographer.instagram && (
          <a
            href={`https://instagram.com/${photographer.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Profilo Instagram di ${fullName}`}
            aria-label={`Visita il profilo Instagram di ${fullName}`}
            className="mt-2 inline-flex items-center gap-2 text-primary hover:opacity-90 transition-colors"
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
