import { GET_COLLECTIONS } from '@/graphql/queries';
import { getClient } from '@/lib/apolloClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollectionsHero from '@/components/collections/CollectionsHero';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';
import Link from 'next/link';

export const dynamic = 'force-static'; // SSG puro

export default async function CollectionsPage() {
  const client = getClient();

  let collections = [];

  try {
    const { data } = await client.query({
      query: GET_COLLECTIONS,
      variables: { locale: 'it' },
    });

    collections = data?.collections || [];
  } catch (error) {
    console.error('Errore nel caricamento delle collezioni:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 px-4">
          <div className="max-w-7xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Errore nel caricamento delle collezioni
            </h1>
            <p className="text-gray-600">
              Si è verificato un errore durante il caricamento. Riprova più tardi.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Collezioni Viaggi Fotografici"
        description="Scopri le nostre collezioni tematiche di viaggi fotografici. Esperienze uniche organizzate per tema e stile fotografico."
        url="https://www.weshoot.it/viaggi-fotografici/collezioni/"
      />
      <Header />
      <CollectionsHero />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection: any) => (
                <Card
                  key={collection.id}
                  className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <Link
                    href={`/viaggi-fotografici/collezioni/${collection.slug}`}
                    className="block"
                  >
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={
                          collection.image?.url ||
                          'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif'
                        }
                        alt={collection.image?.alternativeText || collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">
                          {collection.name}
                        </h3>
                        {collection.excerpt && (
                          <p className="text-gray-200 text-sm text-center line-clamp-2">
                            {collection.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nessuna collezione disponibile
              </h2>
              <p className="text-gray-600 mb-8">
                Le nostre collezioni tematiche saranno presto disponibili.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
