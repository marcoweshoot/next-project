import type { MetadataRoute } from "next";
import { getClient } from "@/lib/apolloClient";
import { GET_COACHES } from "@/graphql/queries/coaches";

export const revalidate = 86400; // 24h: numero letterale

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/viaggi-fotografici", "/fotografi", "/contatti", "/privacy-policy", "/cookie-policy",
  ].map((p) => ({
    url: `${BASE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const client = getClient();
  const { data } = await client.query({ query: GET_COACHES, variables: { locale: "it" } });

  type U = {
    id?: string | number | null;
    slug?: string | null;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    updatedAt?: string | null;
  };

  const coachUrls: MetadataRoute.Sitemap =
    ((data?.users as U[]) ?? []).map((u) => {
      const base = u.slug || u.username || [u.firstName, u.lastName].filter(Boolean).join(" ") || `coach-${u.id ?? ""}`;
      const slug = slugify(base);
      return {
        url: `${BASE_URL}/fotografi/${slug}`,
        lastModified: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });

  return [...staticRoutes, ...coachUrls];
}
