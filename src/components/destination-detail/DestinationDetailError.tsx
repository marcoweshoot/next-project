import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DestinationDetailErrorProps {
  type: 'loading' | 'notFound' | 'missingParam' | 'general';
  destinationSlug?: string;
  currentPath?: string;
}

export default function DestinationDetailError({
  type,
  destinationSlug,
  currentPath
}: DestinationDetailErrorProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'missingParam':
        return {
          title: 'Parametro destinazione mancante',
          message: 'Il parametro della destinazione non è stato trovato nell\'URL.',
          debug: `URL corrente: ${currentPath}`
        };
      case 'notFound':
        return {
          title: 'Destinazione non trovata',
          message: 'La destinazione che stai cercando non esiste o è stata rimossa.',
          debug: null
        };
      case 'general':
        return {
          title: 'Errore nel caricamento della destinazione',
          message: 'Si è verificato un errore durante il caricamento. Riprova più tardi.',
          debug: `Debug: destinationSlug = ${destinationSlug || 'undefined'}`
        };
      default:
        return {
          title: 'Errore',
          message: 'Si è verificato un errore imprevisto.',
          debug: null
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {errorContent.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {errorContent.message}
          </p>
          {errorContent.debug && (
            <p className="text-sm text-gray-400 mb-8">
              {errorContent.debug}
            </p>
          )}
          <Link 
            href="/viaggi-fotografici/destinazioni/" 
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Torna a tutte le destinazioni
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
