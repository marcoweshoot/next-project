import { notFound } from "next/navigation";
import { getClient } from "@/lib/apolloClient";
import {
  GET_PHOTOGRAPHER_BY_USERNAME,
  GET_PHOTOGRAPHER_TOURS,
  GET_COACHES,
} from "@/graphql/queries";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotographerHero from "@/components/photographer-detail/PhotographerHero";
import PhotographerGallery from "@/components/photographer-detail/PhotographerGallery";
import PhotographerTours from "@/components/photographer-detail/PhotographerTours";

export const dynamic = "force-static"; // SSG puro
// Se vuoi ISR, aggiungi: export const revalidate = 60;

const abs = (u?: string) =>
  u ? (u.startsWith("http") ? u : `https://api.weshoot.it${u}`) : undefined;

// Pre-genera tutti gli username disponibili
export async function generateStaticParams() {
  const client = getClient();
  const { data } = await client.query({ query: GET_COACHES });
  const list = data?.coaches || data?.users || [];
  return list.map((coach: any) => ({ username: coach.username }));
}

type PageProps = {
  params: { username: string };
};

export default async function PhotographerPage({ params }: PageProps) {
  const { username } = params;
  const client = getClient();

  // Fetch al build-time
  const [{ data: photographerData }, { data: toursData }] = await Promise.all([
    client.query({
      query: GET_PHOTOGRAPHER_BY_USERNAME,
      variables: { username },
    }),
    client.query({
      query: GET_PHOTOGRAPHER_TOURS,
      variables: { username },
    }),
  ]);

  const photographer = photographerData?.users?.[0] || null;
  if (!photographer) return notFound();

  const tours = toursData?.tours || [];

  return (
    <>
      <SEO
        title={`${photographer.firstName} ${photographer.lastName} – Fotografo WeShoot`}
        description={
          photographer.bio ||
          `Scopri i viaggi fotografici con ${photographer.firstName} ${photographer.lastName}, fotografo professionista WeShoot.`
        }
        url={`https://www.weshoot.it/fotografi/${photographer.username}`}
        image={abs(photographer.profilePicture?.url)}
        type="profile"
      />

      {/* Wrapper a token: ora segue light/dark */}
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />

        <main>
          <PhotographerHero photographer={photographer} />

          {photographer.pictures?.length > 0 && (
            <PhotographerGallery
              pictures={photographer.pictures}
              photographerName={`${photographer.firstName} ${photographer.lastName}`}
            />
          )}

          <PhotographerTours
            tours={tours}
            photographerName={`${photographer.firstName} ${photographer.lastName}`}
            photographerUsername={photographer.username}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
