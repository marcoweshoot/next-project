'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import GalleryLightbox from '../GalleryLightbox';
import type { GalleryLightboxClientProps } from './types';

const GalleryLightboxClient: React.FC<GalleryLightboxClientProps> = ({
  pictures,
  allImagesCount,
  startIndex = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const handleOpen = (index: number = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const processedPictures = useMemo(() => {
    return pictures
      .filter((pic) =>
        Array.isArray(pic.image) ? pic.image.length > 0 : Boolean(pic.image)
      )
      .map((pic, i) => {
        const imagesArray = Array.isArray(pic.image) ? pic.image : [pic.image];
        const rawImage = imagesArray[0];

        const thumbnailUrl = rawImage?.formats?.thumbnail?.url;
        const largeUrl = rawImage?.formats?.large?.url;

        return {
          id: pic.id || `pic-${i}`,
          title: pic.title ?? rawImage?.alternativeText ?? '',
          url: largeUrl || thumbnailUrl || rawImage?.url || '',
          alt: rawImage?.alternativeText ?? pic.title ?? '',
        };
      })
      .map((flatImg) => [flatImg]); // wrap each in an array to match GalleryLightbox signature
  }, [pictures]);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleOpen(0)}
        aria-label={`Apri galleria completa con ${allImagesCount} foto`}
      >
        {allImagesCount === 1
          ? 'Vedi la foto'
          : `Vedi tutte le ${allImagesCount} foto`}
      </Button>

      <GalleryLightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onClose={handleClose}
        pictures={processedPictures}
        startIndex={currentIndex}
      />
    </>
  );
};

export default GalleryLightboxClient;
