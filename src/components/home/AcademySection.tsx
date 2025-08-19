import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { FALLBACKS } from '@/constants/fallbacks';

const features = [
  'Segui i corsi online di fotografia',
  'Condividi con la community le tue foto',
  'Diventa un master',
];

const AcademySection: FC = () => {
  const imageUrl = FALLBACKS.ACADEMY_SECTION;

  return (
    <section className="py-16 bg-white" aria-labelledby="academy-section-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            id="academy-section-title"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            La più completa accademia online di fotografia paesaggistica
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Già oltre <strong>2880 studenti</strong> hanno studiato con WeShoot
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="w-full overflow-hidden rounded-xl shadow-md">
            <Image
              src={imageUrl}
              alt="Accademia fotografica online"
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Accedi all'<span className="text-red-500">accademia fotografica</span>
            </h3>
            <p className="text-lg text-gray-700 font-medium mb-6">
              Migliora le tue foto con i consigli dei professionisti.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((text, i) => (
                <li key={i} className="flex items-start">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 text-white font-bold mr-3">
                    {i + 1}
                  </div>
                  <p className="text-base text-gray-800">{text}</p>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="bg-red-600 text-white">
              <Link
                href="https://accademia.weshoot.it/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Accedi all'accademia fotografica online"
              >
                Inizia Ora
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademySection;
