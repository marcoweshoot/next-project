import type { MetadataRoute } from "next";
import { getClient } from "@/lib/apolloClient";
import { GET_COACHES } from "@/graphql/queries/coaches";
import { gql } from "@apollo/client";

export const revalidate = 86400; // 24h: numero letterale

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Query per ottenere tutti i tour per la sitemap
const GET_ALL_TOURS = gql`
  query GetAllToursForSitemap($locale: String!) {
    tours(locale: $locale, limit: -1) {
      id
      slug
      updated_at
      states {
        slug
      }
      places {
        slug
      }
    }
  }
`;

// Query per ottenere tutte le destinazioni
const GET_ALL_STATES = gql`
  query GetAllStates($locale: String!) {
    states(locale: $locale) {
      id
      slug
      updated_at
    }
  }
`;

// Query per ottenere tutti i places
const GET_ALL_PLACES = gql`
  query GetAllPlaces($locale: String!) {
    places(locale: $locale) {
      id
      slug
      updated_at
      state {
        slug
      }
    }
  }
`;

// Query per ottenere tutte le collezioni
const GET_ALL_COLLECTIONS = gql`
  query GetAllCollections($locale: String!) {
    collections(locale: $locale) {
      id
      slug
      updated_at
    }
  }
`;

// Query per ottenere tutti i corsi
const GET_ALL_COURSES = gql`
  query GetAllCourses($locale: String!) {
    courses(locale: $locale) {
      id
      slug
      updated_at
    }
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1.0 },
    { path: "/viaggi-fotografici", priority: 0.9 },
    { path: "/corsi-di-fotografia", priority: 0.9 },
    { path: "/fotografi", priority: 0.8 },
    { path: "/chi-siamo", priority: 0.7 },
    { path: "/contatti", priority: 0.7 },
    { path: "/recensioni", priority: 0.7 },
    { path: "/privacy-policy", priority: 0.3 },
    { path: "/cookie-policy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/gdpr", priority: 0.3 },
  ].map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));

  const client = getClient();

  try {
    // 1. Fotografi
    const { data: coachesData } = await client.query({ 
      query: GET_COACHES, 
      variables: { locale: "it" } 
    });

    type U = {
      id?: string | number | null;
      slug?: string | null;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      updatedAt?: string | null;
    };

    const coachUrls: MetadataRoute.Sitemap =
      ((coachesData?.users as U[]) ?? []).map((u) => {
        const base = u.slug || u.username || [u.firstName, u.lastName].filter(Boolean).join(" ") || `coach-${u.id ?? ""}`;
        const slug = slugify(base);
        return {
          url: `${BASE_URL}/fotografi/${slug}`,
          lastModified: u.updatedAt ? new Date(u.updatedAt) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });

    // 2. Tour
    const { data: toursData } = await client.query({ 
      query: GET_ALL_TOURS, 
      variables: { locale: "it" } 
    });

    type Tour = {
      id?: string | number | null;
      slug?: string | null;
      updated_at?: string | null;
      states?: Array<{ slug?: string | null }> | null;
      places?: Array<{ slug?: string | null }> | null;
    };

    const tourUrls: MetadataRoute.Sitemap =
      ((toursData?.tours as Tour[]) ?? [])
        .filter((t) => t.slug && t.states?.[0]?.slug && t.places?.[0]?.slug)
        .map((t) => ({
          url: `${BASE_URL}/viaggi-fotografici/destinazioni/${t.states![0].slug}/${t.places![0].slug}/${t.slug}`,
          lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.9,
        }));

    // 3. Destinazioni (States)
    const { data: statesData } = await client.query({ 
      query: GET_ALL_STATES, 
      variables: { locale: "it" } 
    });

    type State = {
      id?: string | number | null;
      slug?: string | null;
      updated_at?: string | null;
    };

    const stateUrls: MetadataRoute.Sitemap =
      ((statesData?.states as State[]) ?? [])
        .filter((s) => s.slug)
        .map((s) => ({
          url: `${BASE_URL}/viaggi-fotografici/destinazioni/${s.slug}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

    // 4. Places (posti dentro le destinazioni)
    const { data: placesData } = await client.query({ 
      query: GET_ALL_PLACES, 
      variables: { locale: "it" } 
    });

    type Place = {
      id?: string | number | null;
      slug?: string | null;
      updated_at?: string | null;
      state?: { slug?: string | null } | null;
    };

    const placeUrls: MetadataRoute.Sitemap =
      ((placesData?.places as Place[]) ?? [])
        .filter((p) => p.slug && p.state?.slug)
        .map((p) => ({
          url: `${BASE_URL}/viaggi-fotografici/destinazioni/${p.state!.slug}/posti/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));

    // 5. Collezioni
    const { data: collectionsData } = await client.query({ 
      query: GET_ALL_COLLECTIONS, 
      variables: { locale: "it" } 
    });

    type Collection = {
      id?: string | number | null;
      slug?: string | null;
      updated_at?: string | null;
    };

    const collectionUrls: MetadataRoute.Sitemap =
      ((collectionsData?.collections as Collection[]) ?? [])
        .filter((c) => c.slug)
        .map((c) => ({
          url: `${BASE_URL}/viaggi-fotografici/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

    // 6. Corsi
    const { data: coursesData } = await client.query({ 
      query: GET_ALL_COURSES, 
      variables: { locale: "it" } 
    });

    type Course = {
      id?: string | number | null;
      slug?: string | null;
      updated_at?: string | null;
    };

    const courseUrls: MetadataRoute.Sitemap =
      ((coursesData?.courses as Course[]) ?? [])
        .filter((c) => c.slug)
        .map((c) => ({
          url: `${BASE_URL}/corsi-di-fotografia/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }));

    // Combina tutto
    return [
      ...staticRoutes,
      ...tourUrls,
      ...stateUrls,
      ...placeUrls,
      ...collectionUrls,
      ...courseUrls,
      ...coachUrls,
    ];

  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Fallback: ritorna almeno le route statiche
    return staticRoutes;
  }
}
