
import React from 'react';
import SessionCard from './SessionCard';
import { Calendar, Clock } from 'lucide-react';

interface TourSessionsProps {
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: number;
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
  const now = new Date();
  
  // Filtra solo le sessioni future e ordinale per data
  const futureSessions = tour.sessions
    ?.filter(session => new Date(session.start) > now)
    ?.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()) || [];

  // Raggruppa le sessioni per anno
  const sessionsByYear = futureSessions.reduce((acc, session) => {
    const year = new Date(session.start).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(session);
    return acc;
  }, {} as Record<number, typeof futureSessions>);

  // Ordina gli anni
  const sortedYears = Object.keys(sessionsByYear).map(Number).sort((a, b) => a - b);

  const renderSession = (session: any, isNext: boolean = false) => {
    // Determina i coach per questa sessione
    const sessionCoaches = session.users && session.users.length > 0 
      ? session.users 
      : tour.coaches;

    // Crea l'oggetto coach per il SessionCard
    const sessionCoach = sessionCoaches && sessionCoaches.length > 0 ? {
      id: sessionCoaches[0].id,
      name: sessionCoaches[0].firstName ? 
        `${sessionCoaches[0].firstName} ${sessionCoaches[0].lastName || ''}`.trim() : 
        sessionCoaches[0].username,
      avatar: {
        url: sessionCoaches[0].profilePicture?.url || coach.avatar?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        alt: sessionCoaches[0].firstName || sessionCoaches[0].username || coach.name
      }
    } : coach;

    return (
      <SessionCard
        key={session.id}
        session={session}
        tour={tour}
        coach={sessionCoach}
        isNext={isNext}
      />
    );
  };

  // Componente Coming Soon per quando non ci sono sessioni future
  const ComingSoonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="mb-4">
        <Calendar className="mx-auto h-16 w-16 text-gray-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Coming Soon
      </h3>
      <p className="text-gray-600 mb-6">
        Nuove date per questo viaggio saranno presto disponibili.
        <br />
        Contattaci per essere informato sulle prossime partenze!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="https://wa.me/393495269093"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
        >
          Contattaci su WhatsApp
        </a>
        <a
          href="mailto:info@weshoot.it"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {futureSessions.length > 0 ? 'Prossime Partenze' : 'Partenze'}
          </h2>
          <p className="text-lg text-gray-600">
            {futureSessions.length > 0 
              ? 'Scegli la data che preferisci per il tuo viaggio fotografico'
              : 'Nuove date saranno presto disponibili per questo viaggio'
            }
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {futureSessions.length > 0 ? (
            sortedYears.map((year, yearIndex) => (
              <div key={year} className={yearIndex > 0 ? "mt-12" : ""}>
                {sortedYears.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {year}
                    </h3>
                    <div className="h-px bg-gray-200"></div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {sessionsByYear[year].map((session, sessionIndex) => {
                    // La prima sessione del primo anno è quella "prossima"
                    const isNext = yearIndex === 0 && sessionIndex === 0;
                    return renderSession(session, isNext);
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
