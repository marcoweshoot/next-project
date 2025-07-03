
import Link from "next/link";
import React from 'react';
import { Instagram } from 'lucide-react';

interface CoachCardProps {
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    bio?: string;
    profilePicture?: {
      localFile?: {
        url: string;
        alternativeText?: string;
      };
    };
    instagram?: string;
  };
}

const CoachCard: React.FC<{
  children?: React.ReactNode;
}> = ({
  coach,
  children
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="text-center group">
      {/* Profile Picture */}
      <div className="relative mb-4">
        {coach.profilePicture?.localFile?.url ? (
          <img
            src={coach.profilePicture.localFile.url}
            alt={`Fotografo ${coach.username} ${coach.firstName}`}
            className="h-32 w-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
          />
        ) : (
          <div className="h-32 w-32 rounded-full mx-auto bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            {getInitials(coach.firstName, coach.lastName)}
          </div>
        )}
      </div>
      {/* Coach Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
          <Link href={`/fotografi/${coach.username}`}>
            {coach.firstName} {coach.lastName}
          </Link>
        </h3>

        {/* Instagram Link */}
        {coach.instagram && (
          <div className="flex justify-center">
            <a
              href={`https://www.instagram.com/${coach.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110"
              title={`Segui ${coach.firstName} ${coach.lastName} su Instagram`}
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachCard;
