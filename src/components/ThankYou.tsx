"use client"


import Link from "next/link";
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, Camera, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GET_COURSES } from '@/graphql/queries/courses';

const ThankYou = () => {
  // Fetch courses data
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(GET_COURSES, {
    variables: { locale: 'it' }
  });

  // Analytics tracking effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Google Analytics tracking
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          currencyCode: 'EUR',
          items: [
            {
              name: 'Tour Deposit',
              id: 0,
              price: 100,
              brand: 'WeShoot',
              category: 'Viaggi Fotografici',
            },
          ],
        },
      });

      // Facebook Pixel tracking
      if (typeof window !== 'undefined') {
        if ((window as any).fbq != null) {
          (window as any).fbq('track', 'Purchase', {
            value: 100,
            currency: 'EUR',
            content_type: 'product',
            content_ids: 0,
          });
        }
      }
    }
  }, []);

  // Get specific courses by ID
  const courses = coursesData?.courses || [];
  const courseBase = courses.find(course => course.id === "1");
  const coursePaesaggio = courses.find(course => course.id === "3");

  // Fallback offers if courses are not loaded yet
  const fallbackOffers = [
    {
      id: 1,
      title: 'Corso Base di Fotografia',
      description: 'Impara le tecniche fondamentali per scattare foto straordinarie durante il tuo viaggio',
      icon: Camera,
      link: '/corsi-di-fotografia/',
      originalPrice: '€19',
      offerPrice: '€9'
    },
    {
      id: 2,
      title: 'Editing Fotografico Avanzato',
      description: 'Scopri come post-processare le tue foto per risultati professionali',
      icon: Star,
      link: '/corsi-di-fotografia/',
      originalPrice: '€149',
      offerPrice: '€99'
    }
  ];

  // Create offers array from Strapi courses or use fallback
  const offers = !coursesLoading && courseBase && coursePaesaggio ? [
    {
      id: courseBase.id,
      title: courseBase.title,
      description: courseBase.excerpt || 'Impara le tecniche fondamentali per scattare foto straordinarie durante il tuo viaggio',
      icon: Camera,
      link: `/corsi-di-fotografia/${courseBase.slug}`,
      originalPrice: '€19',
      offerPrice: courseBase.price ? `€${courseBase.price}` : '€9'
    },
    {
      id: coursePaesaggio.id,
      title: coursePaesaggio.title,
      description: coursePaesaggio.excerpt || 'Scopri come post-processare le tue foto per risultati professionali',
      icon: Star,
      link: `/corsi-di-fotografia/${coursePaesaggio.slug}`,
      originalPrice: '€149',
      offerPrice: coursePaesaggio.price ? `€${coursePaesaggio.price}` : '€99'
    }
  ] : fallbackOffers;

  return (
    <>
      <SEO 
        title="Grazie per la tua prenotazione - WeShoot"
        description="Grazie per aver scelto WeShoot! Non vediamo l'ora di condividere con te questa esperienza fotografica indimenticabile."
      />
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <PageHeader 
          videoUrl="weshoot-viaggi-fotografici"
          theme="dark"
          size="big"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-8">
                <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                Grazie per la tua prenotazione!
              </h1>
              <h2 className="text-xl md:text-2xl text-white/90 animate-fade-in">
                Non vediamo l'ora di condividere con te questa esperienza fotografica indimenticabile
              </h2>
            </div>
          </div>
        </PageHeader>

        {/* Main Content Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Non vediamo l'ora di conoscerti...
              </h2>
            </div>
            
            <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
              <p className="text-xl mb-8">
                Hai appena fatto il primo passo verso un'avventura fotografica che cambierà il tuo modo di vedere il mondo. 
                Il tuo viaggio con WeShoot sarà molto più di una semplice vacanza: sarà un'esperienza di crescita personale 
                e artistica che ti permetterà di catturare momenti unici e creare ricordi indimenticabili.
              </p>
              
              <p className="text-lg mb-8">
                Nelle prossime ore riceverai una email di conferma con tutti i dettagli del tuo viaggio, 
                incluse le informazioni pratiche, l'itinerario dettagliato e i consigli per prepararti al meglio.
              </p>
              
              <p className="text-lg mb-8">
                Il nostro team è già al lavoro per assicurarsi che ogni aspetto del tuo viaggio sia perfetto. 
                Avrai l'opportunità di fotografare luoghi straordinari sotto la guida di fotografi professionisti 
                e di condividere questa passione con altri appassionati come te.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 mb-16">
              <div className="text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">1200+</div>
                <div className="text-gray-600">Viaggiatori Felici</div>
              </div>
              <div className="text-center">
                <Camera className="h-10 w-10 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">200+</div>
                <div className="text-gray-600">Viaggi Organizzati</div>
              </div>
              <div className="text-center">
                <Star className="h-10 w-10 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">22.000+</div>
                <div className="text-gray-600">WeShooters</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-gray-600">Soddisfazione</div>
              </div>
            </div>
          </div>
        </section>

        {/* Offers Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Prima di partire...
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Approfitta dell'offerta limitata sul corso di fotografia per prepararti a fare foto incredibili durante il tuo viaggio
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {offers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <offer.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {offer.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 line-through">
                              {offer.originalPrice}
                            </span>
                            <span className="text-2xl font-bold text-primary">
                              {offer.offerPrice}
                            </span>
                          </div>
                          <Button asChild>
                            <Link href={offer.link}>
                              Scopri di più
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                <Link href="/viaggi-fotografici/">
                  Scopri altri viaggi
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default ThankYou;
