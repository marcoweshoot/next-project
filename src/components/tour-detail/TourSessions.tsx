'use client';

import React from 'react';
import SessionCard from './SessionCard';
import { Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface TourSessionsProps {
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    states: { slug: string }[];
    places: { slug: string }[];
    sessions: Array<{
      id: string;
      start: string;
      end: string;
      status: string;
      price: number;
      currency: string;
      maxPax: number;
      users?: Array<{
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        profilePicture?: {
          id: string;
          url: string;
          alternativeText?: string;
        };
      }>;
    }>;
    coaches: Array<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: {
        id: string;
        url: string;
        alternativeText?: string;
      };
    }>;
  };
  coach: {
    id: string;
    name: string;
    avatar?: {
      url: string;
      alt?: string;
    };
  };
}

const TourSessions: React.FC<TourSessionsProps> = ({ tour, coach }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const now = new Date();

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser({ id: user.id, email: user.email || '' });
        }
      } catch (error) {
        // Ignora errori di autenticazione (403, etc.)
        console.log('User not authenticated, continuing without login');
      }
    };
    getUser();
  }, []);

  // Filtra solo le sessioni future e ordinale per data
  const futureSessions =
    tour.sessions
      ?.filter((session) => new Date(session.start) > now)
      ?.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      ) || [];

  // Raggruppa le sessioni per anno
  const sessionsByYear = futureSessions.reduce((acc, session) => {
    const year = new Date(session.start).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(session);
    return acc;
  }, {} as Record<number, typeof futureSessions>);

  // Ordina gli anni
  const sortedYears = Object.keys(sessionsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  const renderSession = (session: any, isNext: boolean = false) => {
    // Determina i coach per questa sessione
    const sessionCoaches =
      session.users && session.users.length > 0 ? session.users : tour.coaches;

    // Crea l'oggetto coach per il SessionCard
    const sessionCoach =
      sessionCoaches && sessionCoaches.length > 0
        ? {
            id: sessionCoaches[0].id,
            name: sessionCoaches[0].firstName
              ? `${sessionCoaches[0].firstName} ${
                  sessionCoaches[0].lastName || ''
                }`.trim()
              : sessionCoaches[0].username,
            avatar: {
              url:
                sessionCoaches[0].profilePicture?.url ||
                coach.avatar?.url ||
                'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Coach-WeShoot.avif',
              alt:
                sessionCoaches[0].firstName ||
                sessionCoaches[0].username ||
                coach.name,
            },
          }
        : coach;

    return (
      <SessionCard
        session={session}
        tour={tour}
        coach={sessionCoach}
        isNext={isNext}
        showPaymentButton={true}
        user={user}
      />
    );
  };

  // Componente Coming Soon per quando non ci sono sessioni future
  const ComingSoonCard = () => (
    <div className="bg-card rounded-lg border border-border p-8 text-center text-card-foreground">
      <div className="mb-4">
        <Calendar className="mx-auto h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
      <p className="text-muted-foreground mb-6">
        Nuove date per questo viaggio saranno presto disponibili.
        <br />
        Contattaci per essere informato sulle prossime partenze!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="https://wa.me/393495269093"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          Contattaci su WhatsApp
        </a>
        <a
          href="mailto:info@weshoot.it"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium border border-border text-foreground bg-card hover:bg-muted transition-colors"
        >
          Scrivici via Email
        </a>
      </div>
    </div>
  );

  return (
    <section id="sessions" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {futureSessions.length > 0 ? 'Prossime Partenze' : 'Partenze'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {futureSessions.length > 0
              ? 'Scegli la data che preferisci per il tuo viaggio fotografico'
              : 'Nuove date saranno presto disponibili per questo viaggio'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {futureSessions.length > 0 ? (
            sortedYears.map((year, yearIndex) => (
              <div key={`${tour.id}-${year}`} className={yearIndex > 0 ? 'mt-12' : ''}>
                {sortedYears.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {year}
                    </h3>
                    <div className="h-px bg-border"></div>
                  </div>
                )}

                <div className="space-y-4">
                  {sessionsByYear[year].map((session, sessionIndex) => {
                    // La prima sessione del primo anno è quella "prossima"
                    const isNext = yearIndex === 0 && sessionIndex === 0;

                    // ➜ Key unica e stabile anche se id è mancante/duplicato
                    const sessionKey =
                      session?.id && String(session.id).length > 0
                        ? `sess-${session.id}`
                        : `sess-${session.start}-${session.end}-${sessionIndex}`;

                    return (
                      <React.Fragment key={sessionKey}>
                        {renderSession(session, isNext)}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <ComingSoonCard />
          )}
        </div>
      </div>
    </section>
  );
};

export default TourSessions;
