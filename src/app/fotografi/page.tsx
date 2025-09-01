import { getClient } from "@/lib/apolloClient";
import { GET_COACHES } from "@/graphql/queries/coaches";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoachesHero from "@/components/CoachesHero";
import CoachesList from "@/components/CoachesList";

export const dynamic = "force-static"; // SSG

// rende assoluti gli URL che iniziano con "/uploads"
const abs = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `https://api.weshoot.it${u}`) : undefined;

// slugify robusto (accenti, spazi, simboli)
const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default async function CoachesPage() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_COACHES,
    variables: { locale: "it" },
  });

  const coaches = (data?.users ?? []).map((u: any, i: number) => {
    const baseForSlug =
      u.slug ||
      u.username ||
      [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      `coach-${i}`;
    const slug = slugify(baseForSlug);
  
    return {
      id: u?.id != null ? String(u.id) : undefined, // ✅ niente "undefined" stringa
      slug,
      href: `/fotografi/${slug}`,
      username: u.username ?? "",
      firstName: u.firstName ?? null,
      lastName: u.lastName ?? null,
      bio: u.bio ?? null,
      instagram: u.instagram ?? null,
      profilePicture: u.profilePicture
        ? {
            id: u.profilePicture?.id != null ? String(u.profilePicture.id) : `pp-${slug}`,
            url: abs(u.profilePicture.url)!,
            alternativeText: u.profilePicture.alternativeText ?? null,
          }
        : null,
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO
        title="I nostri Fotografi – WeShoot"
        description="Scopri i coach e i fotografi professionisti di WeShoot, pronti ad accompagnarti nei tuoi viaggi fotografici."
        url="https://www.weshoot.it/fotografi"
      />
      <Header />
      <main>
        <CoachesHero />
        <section className="py-20 bg-background">
          <div className="container">
            <CoachesList coaches={coaches} loading={false} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
