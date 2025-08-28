// src/components/home/CollectionSection.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CollectionCarousel from './CollectionCarousel';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  excerpt?: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
}

interface CollectionSectionProps {
  collections: Collection[];
  loading?: boolean;
}

const CollectionSection: React.FC<CollectionSectionProps> = ({
  collections,
  loading = false,
}) => {
  return (
    <section
      className="py-20 bg-background"
      aria-label="Sezione Collezioni di Viaggi Fotografici"
    >
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
            Esplora le Collezioni
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Viaggi fotografici organizzati per tema e passione
          </p>
        </div>

        <div className="mb-16">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative h-80 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <Skeleton className="h-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CollectionCarousel collections={collections} />
          )}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 text-lg font-semibold rounded-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300"
            asChild
          >
            <Link href="/viaggi-fotografici/collezioni">
              Vedi Tutte le Collezioni
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
