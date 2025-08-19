import { gql } from '@apollo/client';
import { getClient } from '@/lib/apolloClient';
import { GET_FUTURE_SESSIONS } from '@/graphql/queries/tours-sessions';

const GET_CALENDAR_PAGE = gql`
  query GetCalendarPage {
    calendarPage {
      SEO {
        metaTitle
        metaDescription
        canonical
        metaImage {
          url
        }
      }
      cover {
        url
      }
    }
  }
`;

export async function fetchCalendarData() {
  const client = getClient();

  try {
    // Only use the working query for now
    const { data } = await client.query({
      query: GET_FUTURE_SESSIONS,
      variables: { limit: 50 },
      fetchPolicy: 'no-cache',
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allSessions = [];

  for (const tour of data.tours) {
    for (const session of tour.sessions || []) {
      const sessionStart = new Date(session.start);
      if (sessionStart >= today) {
        const duration = Math.ceil(
          (new Date(session.end).getTime() - new Date(session.start).getTime()) / (1000 * 60 * 60 * 24)
        );

        const user = session.users?.[0];
        const coach = user
          ? {
              id: user.id,
              name: user.firstName
                ? `${user.firstName} ${user.lastName || ''}`.trim()
                : '',
              avatar: {
                url: user.profilePicture?.url || tour.image?.url || '',
                alt: user.firstName || '',
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

        allSessions.push({
          id: session.id || session.sessionId,
          startDate: session.start,
          endDate: session.end,
          status: session.status || 'scheduled',
          price: session.price || 0,
          currency: session.currency || tour.currency || 'EUR',
          availableSpots: session.maxPax,
          tour: {
            id: tour.id,
            title: tour.title,
            slug: tour.slug,
            duration,
            difficulty: tour.difficulty || '',
            experience_level: tour.experience_level || '',
            price: session.price || 0,
            currency: session.currency || tour.currency || 'EUR',
            cover: {
              url: tour.image?.url || '',
              alt: tour.image?.alternativeText || '',
            },
            places: tour.places || [],
            states: tour.states || [],
            coach,
            sessions: tour.sessions || [],
          },
        });
      }
    }
  }

  // Raggruppamento per mese
  const groupedSessions: Record<string, any> = {};
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
          tours: [],
        };
      }

      groupedSessions[key].tours.push(session.tour);
    });

    const seoData = null; // TODO: Add calendar page SEO when available
    const coverImage = 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//viaggi-fotografici-e-workshop.avif';

    return {
      groupedSessions,
      seoData,
      coverImage,
    };
  } catch (error) {
    console.error('Errore nel fetch dei dati calendario:', error);
    
    // Return default data in case of error
    return {
      groupedSessions: {},
      seoData: null,
      coverImage: 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//viaggi-fotografici-e-workshop.avif',
    };
  }
}
