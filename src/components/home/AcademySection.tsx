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
    <section className="py-16 bg-background" aria-labelledby="academy-section-title">
      <div className="container">
        <header className="mb-12 text-center">
          <h2
            id="academy-section-title"
            className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl"
          >
            La più completa accademia online di fotografia paesaggistica
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Già oltre <strong className="text-foreground">2880 studenti</strong> hanno studiato con WeShoot
          </p>
        </header>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="w-full overflow-hidden rounded-xl border shadow-md">
            <Image
              src={imageUrl}
              alt="Accademia fotografica online"
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>

          <div>
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
              Accedi all'<span className="text-primary">accademia fotografica</span>
            </h3>
            <p className="mb-6 text-lg font-medium text-muted-foreground">
              Migliora le tue foto con i consigli dei professionisti.
            </p>

            <ul className="mb-8 space-y-4">
              {features.map((text, i) => (
                <li key={i} className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-primary-foreground font-bold">
                    {i + 1}
                  </div>
                  <p className="text-base text-foreground">{text}</p>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" variant="default">
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
