'use client';

import React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface GalleryImage {
  id?: string;
  url: string;
  alternativeText?: string;
  caption?: string;
}

interface GalleryCarouselProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export default function GalleryCarousel({ images, onImageClick }: GalleryCarouselProps) {
  // Quante slide sono visibili al primo paint? (matcha i tuoi basis)
  const [initialVisible, setInitialVisible] = React.useState(1);
  React.useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setInitialVisible(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Carousel
          plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
          opts={{ align: 'start', loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {images.map((image, index) =>
              image.url ? (
                <CarouselItem
                  key={image.id || index}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onImageClick(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onImageClick(index);
                      }
                    }}
                    className="relative group overflow-hidden rounded-lg cursor-pointer h-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Apri immagine ${index + 1}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alternativeText || `Immagine ${index + 1}`}
                      fill
                      // 👇 solo le prime N (visibili) sono eager, tutte le altre lazy
                      loading={index < initialVisible ? 'eager' : 'lazy'}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={70}
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <span className="text-xl">🔍</span>
                        </div>
                      </div>
                    </div>

                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-3 text-sm">
                        {image.caption}
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ) : null
            )}
          </CarouselContent>

          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {images.length} foto disponibili – scorri per vederne altre
          </p>
        </div>
      </div>
    </div>
  );
}
