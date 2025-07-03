"use client"

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import GalleryLightbox from './GalleryLightbox';
import GalleryHeader from './gallery/GalleryHeader';
import GalleryGrid from './gallery/GalleryGrid';
import { useGalleryData } from './gallery/useGalleryData';
import { GallerySectionProps } from './gallery/types';

const GallerySection: React.FC<GallerySectionProps> = ({ pictures, loading }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { allImages, galleryImages } = useGalleryData(pictures);
  
  console.log("GallerySection - Pictures data:", pictures);
  console.log("GallerySection - Loading:", loading);

  const handleViewMoreClick = () => {
    console.log("Opening lightbox with images:", allImages);
    setIsLightboxOpen(true);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Caricamento foto...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryHeader />
          <GalleryGrid images={galleryImages} onImageClick={handleViewMoreClick} />
          
          {/* View More Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={handleViewMoreClick}>
              Vedi Altre Foto ({allImages.length} foto totali)
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <GalleryLightbox 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        pictures={pictures || []}
      />
    </>
  );
};

export default GallerySection;
