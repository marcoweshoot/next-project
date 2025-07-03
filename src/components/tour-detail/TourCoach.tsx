'use client';

import Link from "next/link";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Instagram } from 'lucide-react';

interface Coach {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  bio?: string;
  profilePicture?: {
    id: string;
    url: string;
    alternativeText?: string;
  };
  instagram?: string;
}

interface TourCoachProps {
  coaches: Coach[];
}

const TourCoach: React.FC<{
  children?: React.ReactNode;
}> = ({
  coaches,
  children
}) => {
  if (!coaches || coaches.length === 0) {
    return null;
  }

  // Se c'è un solo coach, mostralo in formato singolo
  if (coaches.length === 1) {
    const coach = coaches[0];
    const coachName = coach.firstName ? `${coach.firstName} ${coach.lastName || ''}`.trim() : coach.username;

    return (
      <section id="coach" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Il tuo Coach
            </h2>
            <p className="text-lg text-gray-600">
              Scopri chi ti accompagnerà in questa avventura fotografica
            </p>
          </div>

          <div className="flex justify-center">
            <Card className="max-w-md w-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Profile Picture */}
                  <Avatar className="w-32 h-32">
                    <AvatarImage
                      src={coach.profilePicture?.url}
                      alt={coachName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-2xl font-bold">
                      {coach.firstName?.charAt(0) || coach.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Coach Details */}
                  <div className="w-full">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2">
                        <Link 
                          href={`/fotografi/${coach.username}`} 
                          className="text-gray-900 hover:text-red-600 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {coachName}
                        </Link>
                      </h3>
                      
                      {/* WeShooter Badge */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">W</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Fotografo Certificato
                        </Badge>
                      </div>
                    </div>

                    {/* Bio */}
                    {coach.bio && (
                      <div 
                        className="text-sm text-gray-600 leading-relaxed mb-4"
                        dangerouslySetInnerHTML={{ __html: coach.bio }}
                      />
                    )}

                    {/* Instagram Button */}
                    {coach.instagram && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://www.instagram.com/${coach.instagram}`, '_blank')}
                        className="inline-flex items-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Se ci sono più coach, mostrali in formato team
  return (
    <section id="coach" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Il tuo Team di Coach
          </h2>
          <p className="text-lg text-gray-600">
            Scopri il team di fotografi che ti accompagnerà in questa avventura
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            {coaches.map((coach) => {
              const coachName = coach.firstName ? `${coach.firstName} ${coach.lastName || ''}`.trim() : coach.username;
              
              return (
                <Card key={coach.id} className="h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    {/* Profile Picture */}
                    <Avatar className="w-20 h-20 mb-4">
                      <AvatarImage
                        src={coach.profilePicture?.url}
                        alt={coachName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-lg font-bold">
                        {coach.firstName?.charAt(0) || coach.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Coach Name */}
                    <h3 className="text-lg font-bold mb-2">
                      <Link 
                        href={`/fotografi/${coach.username}`} 
                        className="text-gray-900 hover:text-red-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {coachName}
                      </Link>
                    </h3>

                    {/* WeShooter Badge */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Fotografo Certificato
                      </Badge>
                    </div>

                    {/* Bio (truncated for team view) */}
                    {coach.bio && (
                      <div 
                        className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 text-center"
                        dangerouslySetInnerHTML={{ __html: coach.bio }}
                      />
                    )}

                    {/* Instagram Button */}
                    {coach.instagram && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://www.instagram.com/${coach.instagram}`, '_blank')}
                        className="inline-flex items-center gap-2 mt-auto"
                      >
                        <Instagram className="w-4 h-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourCoach;
