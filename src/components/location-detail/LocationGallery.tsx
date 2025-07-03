"use client"

'use client';

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import LocationGalleryLightbox from './LocationGalleryLightbox';
import GalleryEmptyState from './gallery/GalleryEmptyState';
import GalleryLayout from './gallery/GalleryLayout';

interface LocationGalleryProps {
  pictures: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
  locationTitle: string;
}

const LocationGallery: React.FC<LocationGalleryProps> = ({ pictures, locationTitle }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  console.log("🔍 LocationGallery - Received pictures:", pictures);
  console.log("🔍 LocationGallery - Pictures is array?", Array.isArray(pictures));
  
  // Ensure pictures is always an array and filter out any invalid entries
  const safePictures = Array.isArray(pictures) ? pictures.filter(picture => {
    const isValid = picture && picture.url && picture.url.length > 0;
    if (!isValid) {
      console.log("🔍 LocationGallery - Filtering out invalid picture:", picture);
    }
    return isValid;
  }) : [];
  
  console.log("🔍 LocationGallery - Safe pictures after filtering:", safePictures.length);
  
  if (safePictures.length === 0) {
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
    setCurrentImageIndex((prev) => (prev + 1) % safePictures.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + safePictures.length) % safePictures.length);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Gallery title */}
        <div className="text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Galleria di {locationTitle}
          </h3>
          <p className="text-gray-600">
            {safePictures.length === 1 
              ? '1 foto disponibile' 
              : `${safePictures.length} foto disponibili`
            }
          </p>
        </div>

        {/* Adaptive gallery */}
        <GalleryLayout
          pictures={safePictures}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          openLightbox={openLightbox}
        />
      </div>

      {lightboxOpen && (
        <LocationGalleryLightbox
          pictures={safePictures}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
};

export default LocationGallery;
