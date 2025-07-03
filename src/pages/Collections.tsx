"use client"

import Link from "next/link";
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_COLLECTIONS } from '@/graphql/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollectionsHero from '@/components/collections/CollectionsHero';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';

const Collections = () => {
  const { data, loading, error } = useQuery(GET_COLLECTIONS, {
    variables: { locale: 'it' }
  });

  if (error) {
    console.error('Error loading collections:', error);
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
      {/* New Video Hero */}
      <CollectionsHero />
      {/* Collections Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.collections?.map((collection: any) => (
                <Card key={collection.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <Link href={`/viaggi-fotografici/collezioni/${collection.slug}`} className="block">
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={collection.image?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
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
          )}
          
          {!loading && (!data?.collections || data.collections.length === 0) && (
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
};

export default Collections;
