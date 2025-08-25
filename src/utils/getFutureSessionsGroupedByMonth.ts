import { GET_FUTURE_SESSIONS } from '@/graphql/queries/tours-sessions';
import { GET_CALENDAR_PAGE } from '@/graphql/queries/calendar-page';

export async function getFutureSessionsGroupedByMonth() {
  const API_URL = process.env.STRAPI_GRAPHQL_API! || 'https://api.weshoot.it/graphql';

  // --- FETCH ---
  const futureSessionsRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_FUTURE_SESSIONS.loc?.source.body }),
    next: { revalidate: 60 },
  });

  const calendarPageRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_CALENDAR_PAGE.loc?.source.body }),
    next: { revalidate: 60 },
  });

  const futureSessionsData = await futureSessionsRes.json();
  const calendarPageData = await calendarPageRes.json();

  // --- DATE STABILI ---
  const now = new Date();
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const TZ = 'Europe/Rome';
  const monthLabelFmt = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, month: 'long', year: 'numeric' });
  const partsFmt = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, year: 'numeric', month: 'numeric' });

  const allSessions: any[] = [];

  futureSessionsData?.data?.tours?.forEach((tour: any) => {
    tour.sessions?.forEach((session: any) => {
      const start = new Date(session.start);
      if (start.getTime() >= utcMidnight) {
        const end = new Date(session.end);
        const duration = Math.ceil((end.getTime() - start.getTime()) / 86400000);

        // Coach
        const coach = session.users?.[0]
          ? {
              id: session.users[0].id,
              name: session.users[0].firstName
                ? `${session.users[0].firstName} ${session.users[0].lastName || ''}`.trim()
                : session.users[0].firstName || session.users[0].lastName || '',
              avatar: {
                url: session.users[0].profilePicture?.url || '',
                alt: session.users[0].firstName || session.users[0].lastName || 'Coach',
              },
            }
          : {
              id: '1',
              name: 'WeShoot Team',
              avatar: {
                url: tour.image?.url || '',
                alt: 'WeShoot Team',
              },
            };

        // 👇 Propaga difficulty/experience_level dal TOUR (come da tuo schema)
        const difficulty = tour.difficulty ?? null;
        const experience_level = tour.experience_level ?? null;

        allSessions.push({
          id: session.id,
          startDate: session.start,
          endDate: session.end,
          status: session.status,
          price: session.price,
          currency: session.currency || 'EUR',
          availableSpots: session.maxPax ?? null,
          tour: {
            id: tour.id,
            title: tour.title,
            slug: tour.slug,
            duration,               // non usato a UI per i “giorni”, ma utile se serve altrove
            difficulty,             // ✅ ora disponibile a CalendarSession
            experience_level,       // ✅ idem
            coach,
            places: tour.places,
            states: tour.states,
          },
        });
      }
    });
  });

  // --- GROUP BY MESE (YYYY-MM) ---
  type Group = {
    month: string;   // "agosto"
    year: number;    // 2025
    label: string;   // "agosto 2025"
    tours: typeof allSessions;
  };

  const groupedSessions: Record<string, Group> = {};

  allSessions
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .forEach((s) => {
      const d = new Date(s.startDate);
      const parts = partsFmt.formatToParts(d);
      const y = Number(parts.find((p) => p.type === 'year')!.value);
      const m = Number(parts.find((p) => p.type === 'month')!.value); // 1-12
      const monthKey = `${y}-${String(m).padStart(2, '0')}`;
      const label = monthLabelFmt.format(d);
      const monthOnly = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, month: 'long' }).format(d);

      if (!groupedSessions[monthKey]) {
        groupedSessions[monthKey] = {
          month: monthOnly,
          year: y,
          label,
          tours: [],
        };
      }
      groupedSessions[monthKey].tours.push(s);
    });

  const coverImage =
    calendarPageData?.data?.calendarPage?.cover?.url ||
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/calendar.avif';

  const seoData = calendarPageData?.data?.calendarPage?.SEO || null;

  return {
    groupedSessions,
    coverImage,
    seoData,
  };
}
