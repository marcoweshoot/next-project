import type { MetadataRoute } from "next";
import { getClient } from "@/lib/apolloClient";
import { GET_COACHES } from "@/graphql/queries/coaches";
import { GET_TOURS } from "@/graphql/queries/tours-list";
import { GET_DESTINATIONS } from "@/graphql/queries/destinations";
import { GET_COLLECTIONS } from "@/graphql/queries/collections";
import { GET_COURSES } from "@/graphql/queries/courses";
import { GET_ALL_LOCATIONS } from "@/graphql/queries/locations";

export const revalidate = 86400; // 24h: numero letterale

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1.0 },
    { path: "/viaggi-fotografici", priority: 0.9 },
    { path: "/corsi-di-fotografia", priority: 0.9 },
    { path: "/fotografi", priority: 0.8 },
    { path: "/chi-siamo", priority: 0.7 },
    { path: "/contatti", priority: 0.7 },
    { path: "/recensioni", priority: 0.7 },
    { path: "/promo/porta-un-amico-roma", priority: 0.8 },
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
  const now = new Date();

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
          lastModified: u.updatedAt ? new Date(u.updatedAt) : now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });

    // 2. Tour (con limite alto per prendere tutti)
    const { data: toursData } = await client.query({ 
      query: GET_TOURS, 
      variables: { locale: "it", limit: 1000, start: 0 } 
    });

    type Tour = {
      id?: string | number | null;
      slug?: string | null;
      states?: Array<{ slug?: string | null }> | null;
      places?: Array<{ slug?: string | null }> | null;
    };

    const tourUrls: MetadataRoute.Sitemap =
      ((toursData?.tours as Tour[]) ?? [])
        .filter((t) => t.slug && t.states?.[0]?.slug && t.places?.[0]?.slug)
        .map((t) => ({
          url: `${BASE_URL}/viaggi-fotografici/destinazioni/${t.states![0].slug}/${t.places![0].slug}/${t.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        }));

    // 3. Destinazioni (States)
    const { data: statesData } = await client.query({ 
      query: GET_DESTINATIONS, 
      variables: { locale: "it" } 
    });

    type State = {
      id?: string | number | null;
      slug?: string | null;
    };

    const stateUrls: MetadataRoute.Sitemap =
      ((statesData?.states as State[]) ?? [])
        .filter((s) => s.slug)
        .map((s) => ({
          url: `${BASE_URL}/viaggi-fotografici/destinazioni/${s.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

    // 4. Locations (i singoli spot fotografici)
    // NB: la route /destinazioni/:state/posti/:slug risolve le `locations`, non i `places`.
    // Prima questa sezione derivava gli URL da tour.places[0] e produceva 404 sistematici.
    const { data: locationsData } = await client.query({
      query: GET_ALL_LOCATIONS,
      variables: { locale: "it", limit: 1000 },
    });

    type Location = {
      slug?: string | null;
      updated_at?: string | null;
      state?: { slug?: string | null } | null;
    };

    const locationUrls: MetadataRoute.Sitemap =
      ((locationsData?.locations as Location[]) ?? [])
        .filter((l) => l.slug && l.state?.slug)
        .map((l) => ({
          url: `${BASE_URL}/viaggi-fotografici/destinazioni/${l.state!.slug}/posti/${l.slug}`,
          lastModified: l.updated_at ? new Date(l.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));

    // 5. Collezioni
    const { data: collectionsData } = await client.query({ 
      query: GET_COLLECTIONS, 
      variables: { locale: "it" } 
    });

    type Collection = {
      id?: string | number | null;
      slug?: string | null;
    };

    const collectionUrls: MetadataRoute.Sitemap =
      ((collectionsData?.collections as Collection[]) ?? [])
        .filter((c) => c.slug)
        .map((c) => ({
          url: `${BASE_URL}/viaggi-fotografici/${c.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

    // 6. Corsi
    const { data: coursesData } = await client.query({ 
      query: GET_COURSES, 
      variables: { locale: "it", limit: 100 } 
    });

    type Course = {
      id?: string | number | null;
      slug?: string | null;
    };

    const courseUrls: MetadataRoute.Sitemap =
      ((coursesData?.courses as Course[]) ?? [])
        .filter((c) => c.slug)
        .map((c) => ({
          url: `${BASE_URL}/corsi-di-fotografia/${c.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }));

    // Combina tutto
    return [
      ...staticRoutes,
      ...tourUrls,
      ...stateUrls,
      ...locationUrls,
      ...collectionUrls,
      ...courseUrls,
      ...coachUrls,
    ];

  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    // Fallback: ritorna almeno le route statiche
    return staticRoutes;
  }
}
