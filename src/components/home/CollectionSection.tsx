"use client"

import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowRight } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

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

const CollectionSection: React.FC<{
  children?: React.ReactNode;
}> = ({
  collections,
  loading = false,
  children
}) => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Esplora le Collezioni
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Viaggi fotografici organizzati per tema e passione
          </p>
        </div>

        {/* Collections Carousel */}
        <div className="mb-16">
          {loading ? (
            // Loading skeleton
            (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative h-80 rounded-2xl overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
              ))}
            </div>)
          ) : (
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {collections.map((collection) => (
                  <CarouselItem key={collection.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Link 
                      href={`/viaggi-fotografici/collezioni/${collection.slug}`}
                      className="group cursor-pointer block"
                    >
                      <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <img
                            src={collection.image?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                            alt={collection.image?.alternativeText || collection.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                          <h3 className="text-white text-xl md:text-2xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            {collection.name}
                          </h3>
                          
                          {/* Hover Arrow */}
                          <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <span className="text-sm font-medium mr-2">Esplora</span>
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
          )}
        </div>

        {/* View All Button */}
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
