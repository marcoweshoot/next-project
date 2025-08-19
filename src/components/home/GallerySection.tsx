'use client';

import React from 'react';
import GalleryHeader from '@/components/home/gallery/GalleryHeader';
import GalleryGrid from '@/components/home/gallery/GalleryGrid';
import GalleryLightboxClient from '@/components/home/gallery/GalleryLightboxClient';
import type { GallerySectionProps } from '@/components/home/gallery/types';
import { processGalleryImages } from '@/utils/TourDataUtilis';

const GallerySection: React.FC<GallerySectionProps> = ({
  pictures = [],
  loading,
}) => {
  if (loading) {
    return (
      <section
        className="py-16 bg-white"
        aria-label="Caricamento galleria"
        role="status"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-600">Caricamento foto...</p>
        </div>
      </section>
    );
  }

  // Input grezzo
  const safePictures = Array.isArray(pictures) ? pictures : [];

  // Elabora tutte le immagini
  const allProcessed = processGalleryImages(safePictures);

  // Prendi le prime 12 per la griglia di anteprima
  const galleryImages = allProcessed.slice(0, 12);

  return (
    <section
      className="py-16 bg-white"
      aria-label="Galleria fotografica dei nostri viaggi"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryHeader />

        {/* Griglia di anteprime quadrate cliccabili */}
        <GalleryGrid images={galleryImages} />

        {/* Bottone + Lightbox per tutte le immagini */}
        <div className="text-center mt-12">
          <GalleryLightboxClient
            pictures={safePictures}
            allImagesCount={allProcessed.length}
            startIndex={0}
          />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
