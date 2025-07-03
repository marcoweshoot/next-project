'use client';

import React from 'react';
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

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ images, onImageClick }) => {
  return (
    <section id="gallery" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sei pronto a scattare foto come queste?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            I nostri coach ti porteranno in questi posti e ti insegneranno a scattare queste foto con la tua macchina fotografica
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <Carousel
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: true,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {images.map((image, index) => {
                console.log(`TourGallery: Rendering image ${index}:`, image);
                console.log(`TourGallery: Image URL for ${index}:`, image.url);
                
                if (!image.url) {
                  console.warn(`TourGallery: Missing URL for image ${index}`);
                  return null;
                }
                
                return (
                  <CarouselItem 
                    key={image.id || index} 
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div 
                      className="relative group overflow-hidden rounded-lg cursor-pointer h-64"
                      onClick={() => onImageClick(index)}
                    >
                      <img
                        src={image.url}
                        alt={image.alternativeText || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onLoad={() => console.log(`TourGallery: Image ${index} loaded successfully`)}
                        onError={(e) => {
                          console.error(`TourGallery: Error loading image ${index}:`, e);
                          console.error(`TourGallery: Failed URL:`, image.url);
                        }}
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
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
          
          {/* Mostra il numero totale di foto */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {images.length} foto disponibili - Scorri per vederne altre
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryCarousel;
