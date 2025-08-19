import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TourDetailErrorProps {
  error?: Error;
  data?: any;
}

const TourDetailError: React.FC<TourDetailErrorProps> = ({ error, data }) => {
  console.error('TourDetailError:', { error, data });

  return (
    <>
      <SEO title="Tour non trovato" />
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow pt-24 container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour non trovato</h1>
            <p className="text-gray-600 text-lg mb-6">
              Il viaggio che stai cercando non è disponibile oppure l’URL è errato.
            </p>

            {error && (
              <Alert className="mb-6">
                <AlertDescription>
                  <span className="font-semibold">Errore:</span> {error.message}
                </AlertDescription>
              </Alert>
            )}

            <Link href="/viaggi-fotografici">
              <Button variant="outline" className="text-base">
                Torna alla lista dei viaggi
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TourDetailError;
