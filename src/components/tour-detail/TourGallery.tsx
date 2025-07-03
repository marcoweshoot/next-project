"use client"

'use client';

import React, { useState } from 'react';
import GalleryEmptyState from './gallery/GalleryEmptyState';
import GalleryCarousel from './gallery/GalleryCarousel';
import GalleryLightbox from './gallery/GalleryLightbox';

interface TourGalleryProps {
  gallery: Array<{
    id?: string;
    url: string;
    alternativeText?: string;
    caption?: string;
  }>;
}

const TourGallery: React.FC<TourGalleryProps> = ({ gallery }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log("TourGallery: Gallery data received:", gallery);
  console.log("TourGallery: Gallery length:", gallery?.length);
  console.log("TourGallery: First image structure:", gallery?.[0]);
  
  if (!gallery || gallery.length === 0) {
    console.log("TourGallery: No gallery images available - empty or undefined");
    return <GalleryEmptyState />;
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <>
      <GalleryCarousel images={gallery} onImageClick={openLightbox} />
      
      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        images={gallery}
        currentIndex={currentImageIndex}
        onNext={nextImage}
        onPrev={prevImage}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};

export default TourGallery;
