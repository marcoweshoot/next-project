
import Link from "next/link";
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CollectionDetailErrorProps {
  error?: any;
}

const CollectionDetailError: React.FC<{
  children?: React.ReactNode;
}> = ({
  error,
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section className="pt-20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Collezione non trovata
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            La collezione che stai cercando non esiste o non è più disponibile.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-700 text-sm">
                Errore: {error.message}
              </p>
            </div>
          )}
          
          <Button size="lg" asChild>
            <Link href="/viaggi-fotografici/collezioni">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Torna alle Collezioni
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CollectionDetailError;
