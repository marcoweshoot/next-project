import Link from 'next/link';
import { GET_STORIES } from '@/graphql/queries';
import { getClient } from '@/lib/apolloClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import SEO from '@/components/SEO';
import Image from 'next/image';

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
    <div className="min-h-screen bg-background">
      <SEO
        title="Storie di viaggio"
        description="Le storie di viaggio raccontante attraverso le nostre foto"
        url="https://www.weshoot.it/viaggi-fotografici/storie/"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-gray-900 to-gray-700">
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif)',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
              Storie di viaggio
            </h1>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-primary-foreground/80">
              Le storie di viaggio raccontante attraverso le nostre foto
            </p>
            <div className="flex justify-center">
              <PageBreadcrumbs elements={breadcrumbElements} />
            </div>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {stories.length > 0 ? (
            <div className="space-y-8">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/viaggi-fotografici/storie/${story.slug}`}
                  className="group block"
                >
                  <div className="relative h-80 overflow-hidden rounded-lg bg-gray-900">
                    <Image
                      src={
                        story.photo?.url ||
                        'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//viaggi-fotografici-e-workshop.avif'
                      }
                      alt={story.photo?.alternativeText || story.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      // niente priority qui: non è LCP, resta lazy di default
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <h2 className="text-xl font-bold tracking-wider text-white md:text-2xl uppercase">
                        {story.name}
                      </h2>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Nessuna storia disponibile
              </h2>
              <p className="mb-8 text-muted-foreground">
                Le nostre storie di viaggio saranno presto disponibili.
              </p>
              <Link
                href="/viaggi-fotografici/"
                className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90"
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
