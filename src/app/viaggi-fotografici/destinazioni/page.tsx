import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { gql } from 'graphql-request';
import { getClient } from '@/lib/graphqlClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DestinationsHero from '@/components/destinations/DestinationsHero';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';

const GET_DESTINATIONS = gql`
  query GetDestinations {
    states {
      id
      name
      slug
      image {
        url
        alternativeText
      }
    }
  }
`;

export const dynamic = 'force-static'; // ✅ SSG abilitato

export default async function DestinationsPage() {
  let data = null;
  let error = null;

  try {
    const client = getClient();
    const response = await client.request(GET_DESTINATIONS, { locale: 'it' });
    data = response;
  } catch (err) {
    console.error('❌ Errore durante il fetch delle destinazioni:', err);
    error = err;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        {/* ✅ Preload del poster AVIF usato nella Hero */}
        <link
          rel="preload"
          as="image"
          href="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif"
          type="image/avif"
        />
      </Head>

      <SEO
        title="Destinazioni Viaggi Fotografici"
        description="Scopri le incredibili destinazioni per i tuoi viaggi fotografici. Esplora paesaggi mozzafiato e cattura momenti indimenticabili."
        url="https://www.weshoot.it/viaggi-fotografici/destinazioni/"
      />
      <Header />
      <DestinationsHero />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Errore nel caricamento delle destinazioni
              </h1>
              <p className="text-gray-600">Riprova più tardi.</p>
            </div>
          ) : !data?.states ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data.states.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nessuna destinazione disponibile
              </h2>
              <p className="text-gray-600 mb-8">
                Le nostre destinazioni per viaggi fotografici saranno presto disponibili.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.states.map((destination: any) => (
                <Card
                  key={destination.id}
                  className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <Link
                    href={`/viaggi-fotografici/destinazioni/${destination.slug}`}
                    className="block"
                  >
                    <div className="relative overflow-hidden h-64">
                      <Image
                        src={destination.image?.url || '/fallback.jpg'}
                        alt={destination.image?.alternativeText || destination.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">
                          {destination.name?.toUpperCase()}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
