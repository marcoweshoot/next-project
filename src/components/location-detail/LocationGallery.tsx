'use client';

import React, { useState, useMemo, useCallback } from 'react';
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

  // Sanitizza e memoizza le immagini valide
  const safePictures = useMemo(() => {
    return Array.isArray(pictures)
      ? pictures.filter(
          (p) => p && typeof p.url === 'string' && p.url.length > 0
        )
      : [];
  }, [pictures]);

  if (safePictures.length === 0) {
    return <GalleryEmptyState />;
  }

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % safePictures.length);
  }, [safePictures.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + safePictures.length) % safePictures.length);
  }, [safePictures.length]);

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
              : `${safePictures.length} foto disponibili`}
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

function arePropsEqual(prev: LocationGalleryProps, next: LocationGalleryProps) {
  if (prev.locationTitle !== next.locationTitle) return false;

  const a = Array.isArray(prev.pictures) ? prev.pictures : [];
  const b = Array.isArray(next.pictures) ? next.pictures : [];
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    const p1 = a[i];
    const p2 = b[i];
    if (
      p1.id !== p2.id ||
      p1.title !== p2.title ||
      p1.url !== p2.url ||
      p1.alternativeText !== p2.alternativeText
    ) {
      return false;
    }
  }
  return true;
}

LocationGallery.displayName = 'LocationGallery';

export default React.memo(LocationGallery, arePropsEqual);
