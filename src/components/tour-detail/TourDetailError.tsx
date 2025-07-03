
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TourDetailErrorProps {
  error?: Error;
  data?: any;
}

const TourDetailError: React.FC<TourDetailErrorProps> = ({ error, data }) => {
  console.log('Error:', error);
  console.log('Data:', data);

  return (
    <>
      <SEO title="Tour non trovato" />
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16 container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              Tour non trovato. Verifica l'URL o torna alla lista dei viaggi.
              {error && <div className="mt-2 text-sm">Errore: {error.message}</div>}
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TourDetailError;
