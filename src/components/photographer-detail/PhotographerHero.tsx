
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Instagram } from 'lucide-react';

interface PhotographerHeroProps {
  photographer: {
    firstName: string;
    lastName: string;
    bio?: string;
    username: string;
    instagram?: string;
    profilePicture?: {
      url: string;
      alternativeText?: string;
    };
    cover?: {
      url: string;
      alternativeText?: string;
    };
  };
  loading?: boolean;
}

const PhotographerHero: React.FC<PhotographerHeroProps> = ({ photographer, loading }) => {
  // Helper function per gestire gli URL delle immagini
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://api.weshoot.it${url}`;
  };

  if (loading) {
    return (
      <div className="relative h-[70vh] bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const backgroundImage = photographer.cover?.url 
    ? getImageUrl(photographer.cover.url)
    : 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

  const profilePictureUrl = photographer.profilePicture?.url 
    ? getImageUrl(photographer.profilePicture.url)
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          {/* Profile Picture */}
          <div className="mb-8">
            <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-2xl">
              <AvatarImage
                src={profilePictureUrl}
                alt={`${photographer.firstName} ${photographer.lastName}`}
              />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-2xl font-bold">
                {photographer.firstName.charAt(0)}{photographer.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* WeShoot Logo */}
          <div className="mb-6 animate-fade-in">
            <img 
              src="/lovable-uploads/759cd14e-fb23-4e8f-ad1a-d8a690a28a83.png" 
              alt="WeShoot" 
              className="h-16 w-auto mx-auto"
            />
          </div>

          {/* Name */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
            {photographer.firstName} {photographer.lastName}
          </h2>

          {/* Bio */}
          {photographer.bio && (
            <div 
              className="text-xl md:text-2xl font-light leading-relaxed mb-8 animate-fade-in max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: photographer.bio }}
            />
          )}

          {/* Instagram Link */}
          {photographer.instagram && (
            <div className="animate-fade-in mb-8">
              <a
                href={`https://instagram.com/${photographer.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-110"
                title={`Segui @${photographer.instagram} su Instagram`}
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          )}

          {/* Breadcrumbs */}
          <div className="mt-12 text-sm text-gray-300">
            <span>WeShoot</span>
            <span className="mx-2">/</span>
            <span>Fotografi</span>
            <span className="mx-2">/</span>
            <span className="text-white">{photographer.firstName} {photographer.lastName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerHero;
