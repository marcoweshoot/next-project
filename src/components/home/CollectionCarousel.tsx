'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight } from 'lucide-react';
import { FALLBACKS } from '@/constants/fallbacks';

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

interface CollectionCarouselProps {
  collections: Collection[];
}

const CollectionCarousel: React.FC<CollectionCarouselProps> = ({ collections }) => {
  const plugin = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{ align: 'start', loop: true }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {collections.map((collection) => (
          <CarouselItem
            key={collection.id}
            className="basis-full pl-2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 md:pl-4"
          >
            <Link
              href={`/viaggi-fotografici/collezioni/${collection.slug}`}
              className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative h-80 overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={collection.image?.url || FALLBACKS.COLLECTION_IMAGE}
                    alt={collection.image?.alternativeText || collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="rounded-2xl object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={false}
                  />
                </div>

                {/* Gradient Overlay (più denso in dark) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent dark:from-black/85 dark:via-black/30 dark:to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="mb-2 translate-y-2 text-xl font-bold text-primary-foreground transition-transform duration-300 group-hover:translate-y-0 md:text-2xl">
                    {collection.name}
                  </h3>

                  <div className="flex translate-x-4 items-center text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="mr-2 text-sm font-medium">Esplora</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute right-4 top-4 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100 border-t-2 border-r-2 border-primary-foreground/40" />
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Controls tema-aware */}
      <CarouselPrevious
        className="hidden md:flex -left-12 border bg-card/80 text-foreground backdrop-blur transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Precedente"
      />
      <CarouselNext
        className="hidden md:flex -right-12 border bg-card/80 text-foreground backdrop-blur transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Successivo"
      />
    </Carousel>
  );
};

export default CollectionCarousel;
