
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StoryErrorProps {
  error?: Error;
  notFound?: boolean;
}

const StoryError: React.FC<StoryErrorProps> = ({ error, notFound }) => {
  const title = notFound ? "Storia non trovata" : "Errore nel caricamento";
  const message = notFound 
    ? "Storia non trovata. Verifica che l'URL sia corretto."
    : "Errore nel caricamento della storia. Riprova più tardi.";

  return (
    <>
      <SEO title={title} />
      <Header />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              {message}
              {error && (
                <div className="mt-2 text-sm">Errore: {error.message}</div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StoryError;
