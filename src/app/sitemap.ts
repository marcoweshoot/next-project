// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getClient } from "@/lib/apolloClient";
import { GET_COACHES } from "@/graphql/queries/coaches";
// TODO: crea una query minimal per i soli slug dei tour
// import { GET_TOUR_SLUGS } from "@/graphql/queries/tourSlugs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.weshoot.it";

// rigenera 1 volta al giorno (SSG + revalidate)
export const revalidate = 60 * 60 * 24;

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // rotte statiche principali
  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/viaggi-fotografici", "/fotografi", "/contatti", "/privacy-policy", "/cookie-policy"
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const client = getClient();

  // --- COACHES
  const { data: coachData } = await client.query({
    query: GET_COACHES,
    variables: { locale: "it" },
  });

  const coachUrls: MetadataRoute.Sitemap = (coachData?.users ?? []).map((u: any) => {
    const base = u.slug || u.username || [u.firstName, u.lastName].filter(Boolean).join(" ") || `coach-${u.id}`;
    const slug = slugify(base);
    return {
      url: `${BASE_URL}/fotografi/${slug}`,
      lastModified: new Date(u.updatedAt ?? Date.now()),
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  // --- TOURS (ESEMPIO: adatta ai tuoi tipi/route)
  // const { data: toursData } = await client.query({
  //   query: GET_TOUR_SLUGS,
  //   variables: { locale: "it" },
  // });
  // const tourUrls: MetadataRoute.Sitemap = (toursData?.tours ?? []).flatMap((t: any) => {
  //   const state = t.states?.[0]?.slug;
  //   const place = t.places?.[0]?.slug;
  //   const tour = t.slug;
  //   if (!state || !place || !tour) return [];
  //   return [{
  //     url: `${BASE_URL}/viaggi-fotografici/destinazioni/${state}/${place}/${tour}`,
  //     lastModified: new Date(t.updatedAt ?? Date.now()),
  //     changeFrequency: "weekly",
  //     priority: 0.8,
  //   }];
  // });

  return [
    ...staticRoutes,
    ...coachUrls,
    // ...tourUrls,
  ];
}
