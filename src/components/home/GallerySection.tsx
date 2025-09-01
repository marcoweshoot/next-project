'use client';

import React, { useState } from 'react';
import GalleryHeader from '@/components/home/gallery/GalleryHeader';
import GalleryGrid from '@/components/home/gallery/GalleryGrid';
import GalleryLightboxClient from '@/components/home/gallery/GalleryLightboxClient';
import type { GallerySectionProps } from '@/components/home/gallery/types';
import { processGalleryImages } from '@/utils/TourDataUtilis';

const GallerySection: React.FC<GallerySectionProps> = ({ pictures = [], loading }) => {
  // ✅ Gli hook DEVONO stare sempre qui, in cima
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  if (loading) {
    return (
      <section
        className="py-16 bg-background"
        aria-label="Caricamento galleria"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="container text-center">
          <p className="text-lg text-muted-foreground">Caricamento foto...</p>
        </div>
      </section>
    );
  }

  const safePictures = Array.isArray(pictures) ? pictures : [];
  const allProcessed = processGalleryImages(safePictures);
  const galleryImages = allProcessed.slice(0, 12);

  return (
    <section
      className="py-16 bg-background"
      aria-label="Galleria fotografica dei nostri viaggi"
      role="region"
    >
      <div className="container">
        <GalleryHeader />

        {/* 👉 collega il click delle anteprime all’apertura della lightbox */}
        <GalleryGrid
          images={galleryImages}
          onImageClick={(idx) => {
            setLbIndex(idx);
            setLbOpen(true);
          }}
        />

        {/* Bottone + Lightbox (controllata da questo componente) */}
        <div className="mt-12 text-center">
          <GalleryLightboxClient
            pictures={allProcessed}
            allImagesCount={allProcessed.length}
            startIndex={lbIndex}
            isOpen={lbOpen}
            onOpenChange={setLbOpen}
          />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
