
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

const StoryLoading: React.FC = () => {
  return (
    <>
      <SEO title="Caricamento storia..." />
      <Header />
      <div className="min-h-screen bg-white">
        <div className="h-96 bg-gray-200 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StoryLoading;
