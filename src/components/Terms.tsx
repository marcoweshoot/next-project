"use client"

import Link from "next/link";
import React from 'react';
import { useQuery } from '@apollo/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { GET_TERMS_CONDITIONS } from '@/graphql/queries';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';

const Terms = () => {
  const { data, loading, error } = useQuery(GET_TERMS_CONDITIONS);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Caricamento...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    console.error('Error loading terms:', error);
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Errore nel caricamento dei termini e condizioni</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const termsData = data?.terminiCondizioniPage;

  return (
    <>
      <SEO 
        title={termsData?.title || "Termini e Condizioni"}
        description="Termini e condizioni d'uso per i servizi WeShoot.it - Viaggi fotografici e corsi di fotografia"
        url="https://www.weshoot.it/termini"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative py-24 bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {termsData?.title || "Termini e Condizioni"}
            </h1>
            
            {termsData?.subtitle && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                {termsData.subtitle}
              </p>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex justify-center mb-8">
              <Breadcrumb>
                <BreadcrumbList className="text-white">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="text-gray-300 hover:text-white">
                        WeShoot
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">
                      Termini e Condizioni
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </section>
      {/* Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            {termsData?.body ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: termsData.body }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                <p>Contenuto non disponibile al momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Terms;
