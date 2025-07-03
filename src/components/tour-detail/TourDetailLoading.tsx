
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

const TourDetailLoading: React.FC = () => {
  return (
    <>
      <SEO title="Caricamento..." />
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16">
          <div className="h-96 bg-gray-200 animate-pulse" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TourDetailLoading;
