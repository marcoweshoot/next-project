'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import GalleryLightbox from '../GalleryLightbox';

export type GalleryLightboxClientProps = {
  pictures: any[];
  allImagesCount: number;
  startIndex?: number;
  /** opzionali: permette controllo esterno */
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const GalleryLightboxClient: React.FC<GalleryLightboxClientProps> = ({
  pictures,
  allImagesCount,
  startIndex = 0,
  isOpen,
  onOpenChange,
}) => {
  // supporta sia modalità controllata che non-controllata
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  useEffect(() => { setCurrentIndex(startIndex); }, [startIndex]);

  const handleOpen = (index: number = 0) => { setCurrentIndex(index); setOpen(true); };
  const handleClose = () => setOpen(false);

  const processedPictures = useMemo(() => {
    return pictures
      .filter((pic) =>
        Array.isArray(pic.image) ? pic.image.length > 0 : Boolean(pic.image)
      )
      .map((pic, i) => {
        const imagesArray = Array.isArray(pic.image) ? pic.image : [pic.image];
        const rawImage = imagesArray[0] ?? {};
        const thumbnailUrl = rawImage?.formats?.thumbnail?.url;
        const largeUrl = rawImage?.formats?.large?.url;
        return {
          id: pic.id || `pic-${i}`,
          title: pic.title ?? rawImage?.alternativeText ?? '',
          url: largeUrl || thumbnailUrl || rawImage?.url || '',
          alt: rawImage?.alternativeText ?? pic.title ?? '',
        };
      })
      .map((flatImg) => [flatImg]); // mantiene la firma attesa dalla Lightbox
  }, [pictures]);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleOpen(0)}
        aria-label={`Apri galleria completa con ${allImagesCount} foto`}
      >
        {allImagesCount === 1 ? 'Vedi la foto' : `Vedi tutte le ${allImagesCount} foto`}
      </Button>

      <GalleryLightbox
        isOpen={open}
        onOpenChange={setOpen}
        onClose={handleClose}
        pictures={processedPictures}
        startIndex={currentIndex}
      />
    </>
  );
};

export default GalleryLightboxClient;
