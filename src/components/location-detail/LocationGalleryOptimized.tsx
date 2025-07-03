"use client"

'use client';

import React, { useState, useCallback } from 'react';
import OptimizedImage from './OptimizedImage';
import LocationGalleryLightbox from './LocationGalleryLightbox';

interface LocationGalleryOptimizedProps {
  pictures: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
  locationTitle: string;
}

const LocationGalleryOptimized: React.FC<LocationGalleryOptimizedProps> = ({ 
  pictures, 
  locationTitle 
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  if (!pictures || pictures.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Galleria fotografica di {locationTitle}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scopri la bellezza di questa location attraverso gli scatti dei nostri viaggi fotografici
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pictures.map((picture, index) => (
          <div key={picture.id} className="aspect-video">
            <OptimizedImage
              src={picture.url}
              alt={picture.alternativeText || picture.title}
              className="w-full h-full rounded-lg shadow-lg"
              onClick={() => openLightbox(index)}
            />
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <LocationGalleryLightbox
          pictures={pictures}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onNext={() => setCurrentImageIndex((prev) => (prev + 1) % pictures.length)}
          onPrev={() => setCurrentImageIndex((prev) => (prev - 1 + pictures.length) % pictures.length)}
        />
      )}
    </div>
  );
};

export default LocationGalleryOptimized;
