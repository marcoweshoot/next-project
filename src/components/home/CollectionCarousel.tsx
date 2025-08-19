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
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {collections.map((collection) => (
          <CarouselItem
            key={collection.id}
            className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <Link
              href={`/viaggi-fotografici/collezioni/${collection.slug}`}
              className="group cursor-pointer block"
            >
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={collection.image?.url || FALLBACKS.COLLECTION_IMAGE}
                    alt={
                      collection.image?.alternativeText ||
                      collection.name
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 rounded-2xl"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {collection.name}
                  </h3>

                  <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <span className="text-sm font-medium mr-2">
                      Esplora
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-12 bg-white/80 backdrop-blur-sm hover:bg-white border-gray-200" />
      <CarouselNext className="hidden md:flex -right-12 bg-white/80 backdrop-blur-sm hover:bg-white border-gray-200" />
    </Carousel>
  );
};

export default CollectionCarousel;
