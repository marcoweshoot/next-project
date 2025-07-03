"use client"

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_REVIEWS } from '@/graphql/queries';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewsEmptyState from '@/components/reviews/ReviewsEmptyState';
import ReviewsError from '@/components/reviews/ReviewsError';
import ReviewsLoading from '@/components/reviews/ReviewsLoading';

const Reviews = () => {
  const { data, loading, error } = useQuery(GET_REVIEWS, {
    variables: { limit: 50 }
  });

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Recensioni' }
  ];

  if (error) {
    console.error('Error loading reviews:', error);
    return <ReviewsError />;
  }

  const placeholderReviews = [
    {
      id: '1',
      rating: 5,
      description: 'Ciao a tutti, grazie per la bella giornata di ieri, sotto tutti gli aspetti. Un caro saluto Stefano',
      user: { firstName: 'Stefano', profilePicture: null },
      tour: { title: 'Workshop Fotografico alle Cinque Terre', slug: 'cinque-terre-workshop' },
      created_at: '2024-07-07'
    },
    {
      id: '2',
      rating: 5,
      description: 'Grazie Samuele per la splendida giornata di fotografia e per il tuo occhio attento nel dare consigli preziosi! Oltre alla luce perfetta, ho trovato in te un compagno di viaggio molto simpatico e disponibile. Spero di partecipare ad altri tuoi workshop.',
      user: { firstName: 'Michele', profilePicture: null },
      tour: { title: 'Workshop Fotografico alle Cinque Terre', slug: 'cinque-terre-workshop' },
      created_at: '2024-07-07'
    },
    {
      id: '3',
      rating: 5,
      description: 'Samuele sei stato una guida esemplare, paziente, gentile, molto preparato sia per gli esperti sia per i più particolarini (parlo per me). È stata una giornata molto intensa e ricca di spunti fotografici. Grazie mille!',
      user: { firstName: 'Paola', profilePicture: null },
      tour: { title: 'Workshop Fotografico alle Cinque Terre', slug: 'cinque-terre-workshop' },
      created_at: '2024-07-07'
    },
    {
      id: '4',
      rating: 5,
      description: 'Ho avuto il piacere di partecipare a un viaggio fotografico alle isole Lofoten con questa incredibile agenzia, e posso dire senza esitazioni che è stata un\'esperienza straordinaria che ha superato ogni mia aspettativa. L\'organizzazione è stata impeccabile fin dal primo momento.',
      user: { firstName: 'Andrea', profilePicture: null },
      tour: { title: 'Viaggio Fotografico alle Isole Lofoten', slug: 'lofoten-photo-tour' },
      created_at: '2024-07-07'
    },
    {
      id: '5',
      rating: 5,
      description: 'Esperienza veramente unica sia per gli scatti fatti e sia per i luoghi visitati con Alessandro che si è dimostrato sempre disponibile nei nostri confronti e molto preparato sotto tutti gli aspetti. Consigliatissimo!',
      user: { firstName: 'Nicola', profilePicture: null },
      tour: { title: 'Tour Fotografico delle Dolomiti', slug: 'dolomiti-photo-tour' },
      created_at: '2024-07-07'
    },
    {
      id: '6',
      rating: 5,
      description: 'In appena tre giorni sulle Dolomiti abbiamo portato a casa delle bellissime foto (complice anche il meteo fortunato), imparato nozioni tecniche importanti e visitato luoghi mozzafiato. Alessandro è stato una guida eccezionale.',
      user: { firstName: 'Stefano', profilePicture: null },
      tour: { title: 'Tour Fotografico delle Dolomiti', slug: 'dolomiti-photo-tour' },
      created_at: '2024-07-17'
    }
  ];

  const reviews = data?.reviews || placeholderReviews;
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Recensioni - Dicono di noi"
        description={`${totalReviews}+ recensioni non possono sbagliare...`}
        url="https://www.weshoot.it/recensioni/"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20">
        <div className="absolute inset-0 bg-black/40" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Dicono di noi
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              {totalReviews}+ recensioni non possono sbagliare...
            </p>
            
            {/* Breadcrumbs */}
            <div className="flex justify-center">
              <PageBreadcrumbs elements={breadcrumbElements} />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <ReviewsLoading />
          ) : (
            <>
              {(!reviews || reviews.length === 0) ? (
                <ReviewsEmptyState />
              ) : (
                <ReviewsList reviews={reviews} />
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Reviews;
