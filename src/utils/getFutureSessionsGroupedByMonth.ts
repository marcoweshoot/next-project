import { GET_FUTURE_SESSIONS } from '@/graphql/queries/tours-sessions';
import { GET_CALENDAR_PAGE } from '@/graphql/queries/calendar-page';

export async function getFutureSessionsGroupedByMonth() {
  const API_URL = process.env.STRAPI_GRAPHQL_API! || 'https://api.weshoot.it/graphql';

  // Fetch dati delle sessioni
  const futureSessionsRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_FUTURE_SESSIONS.loc?.source.body }),
    next: { revalidate: 60 } // opzionale per ISR
  });

  // Fetch dati della pagina (inclusi SEO)
  const calendarPageRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_CALENDAR_PAGE.loc?.source.body }),
    next: { revalidate: 60 }
  });

  const futureSessionsData = await futureSessionsRes.json();
  const calendarPageData = await calendarPageRes.json();

  const allSessions = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  futureSessionsData?.data?.tours?.forEach((tour: any) => {
    tour.sessions?.forEach((session: any) => {
      const sessionDate = new Date(session.start);
      if (sessionDate >= today) {
        const startDate = new Date(session.start);
        const endDate = new Date(session.end);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        const coach = session.users?.[0]
          ? {
              id: session.users[0].id,
              name: session.users[0].firstName
                ? `${session.users[0].firstName} ${session.users[0].lastName || ''}`.trim()
                : session.users[0].username,
              avatar: {
                url: session.users[0].profilePicture?.url || '',
                alt: session.users[0].firstName || session.users[0].username
              }
            }
          : {
              id: '1',
              name: 'WeShoot Team',
              avatar: {
                url: tour.image?.url || '',
                alt: 'WeShoot Team'
              }
            };

            allSessions.push({
              id: session.id,
              startDate: session.start,
              endDate: session.end,
              status: session.status,
              price: session.price,
              currency: session.currency || 'EUR',
              availableSpots: session.maxPax,
              tour: {
                id: tour.id,
                title: tour.title,
                slug: tour.slug,
                duration,
                coach,
                places: tour.places,  // ✅ aggiungi questi
                states: tour.states   // ✅ aggiungi questi
          }
        });
      }
    });
  });

  const groupedSessions: {
    [key: string]: {
      month: string;
      year: number;
      tours: typeof allSessions;
    };
  } = {};

  allSessions
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .forEach((session) => {
      const date = new Date(session.startDate);
      const year = date.getFullYear();
      const month = date.toLocaleDateString('it-IT', { month: 'long' });
      const key = `${year}-${month}`;

      if (!groupedSessions[key]) {
        groupedSessions[key] = {
          month,
          year,
          tours: []
        };
      }

      groupedSessions[key].tours.push(session);
    });

  const coverImage =
    calendarPageData?.data?.calendarPage?.cover?.url ||
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif';

  const seoData = calendarPageData?.data?.calendarPage?.SEO || null;

  return {
    groupedSessions,
    coverImage,
    seoData
  };
}