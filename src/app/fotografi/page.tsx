import { getClient } from '@/lib/apolloClient';
import { GET_COACHES } from '@/graphql/queries/coaches';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CoachesHero from '@/components/CoachesHero';
import CoachesList from '@/components/CoachesList';

export const dynamic = 'force-static';  // SSG

// helper: rende assoluti gli URL che iniziano con "/uploads"
const abs = (u?: string | null) =>
  u ? (u.startsWith('http') ? u : `https://api.weshoot.it${u}`) : undefined;

export default async function CoachesPage() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_COACHES,
    variables: { locale: 'it' }, // rimuovi se la query non usa i18n
  });

  // 🔧 Normalizza verso la shape attesa da <CoachesList /> / <CoachCard />
  const coaches = (data?.users ?? []).map((u: any) => ({
    id: u.id,
    username: u.username,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    bio: u.bio ?? null,
    instagram: u.instagram ?? null,
    profilePicture: u.profilePicture
      ? {
          id: u.profilePicture.id ?? `pp-${u.id}`,
          url: abs(u.profilePicture.url)!,               // <-- URL assoluto
          alternativeText: u.profilePicture.alternativeText ?? null,
        }
      : null,
  }));

  return (
    <>
      <SEO
        title="I nostri Fotografi – WeShoot"
        description="Scopri i coach e i fotografi professionisti di WeShoot, pronti ad accompagnarti nei tuoi viaggi fotografici."
        url="https://www.weshoot.it/fotografi"
      />
      <Header />
      <CoachesHero />
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CoachesList coaches={coaches} loading={false} />
        </div>
      </section>
      <Footer />
    </>
  );
}
