import Link from 'next/link';
import { GET_STORIES } from '@/graphql/queries';
import { getClient } from '@/lib/apolloClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import SEO from '@/components/SEO';

export const dynamic = 'force-static';
export const revalidate = 60;

type Story = {
  id: string;
  slug: string;
  name: string;
  photo?: { url?: string; alternativeText?: string };
};

export default async function StoriesPage() {
  let stories: Story[] = [];

  try {
    const { data } = await getClient().query({
      query: GET_STORIES,
      variables: { locale: 'it' },
      fetchPolicy: 'no-cache',
    });
    stories = data?.stories || [];
  } catch {
    stories = [];
  }

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Storie di viaggio' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Storie di viaggio"
        description="Le storie di viaggio raccontante attraverso le nostre foto"
        url="https://www.weshoot.it/viaggi-fotografici/storie/"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20">
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif)',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Storie di viaggio
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Le storie di viaggio raccontante attraverso le nostre foto
            </p>
            <div className="flex justify-center">
              <PageBreadcrumbs elements={breadcrumbElements} />
            </div>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {stories.length > 0 ? (
            <div className="space-y-8">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/viaggi-fotografici/storie/${story.slug}`}
                  className="block group"
                >
                  <div className="relative overflow-hidden rounded-lg h-80 bg-gray-900">
                    <img
                      src={
                        story.photo?.url ||
                        'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//viaggi-fotografici-e-workshop.avif'
                      }
                      alt={story.photo?.alternativeText || story.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <h2 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
                        {story.name}
                      </h2>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nessuna storia disponibile
              </h2>
              <p className="text-gray-600 mb-8">
                Le nostre storie di viaggio saranno presto disponibili.
              </p>
              <Link
                href="/viaggi-fotografici/"
                className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Scopri tutti i viaggi
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
