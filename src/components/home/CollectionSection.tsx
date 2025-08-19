// src/components/home/CollectionSection.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FALLBACKS } from '@/constants/fallbacks';
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
      className="py-20 bg-white"
      aria-label="Sezione Collezioni di Viaggi Fotografici"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Esplora le Collezioni
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Viaggi fotografici organizzati per tema e passione
          </p>
        </div>

        <div className="mb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative h-80 rounded-2xl overflow-hidden">
                    <Skeleton className="w-full h-full" />
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
            className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
            asChild
          >
            <Link href="/viaggi-fotografici/collezioni">
              Vedi Tutte le Collezioni
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
