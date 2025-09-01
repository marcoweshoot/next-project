'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import GalleryLightbox from '../GalleryLightbox';
import { processGalleryImages } from '@/utils/TourDataUtilis';

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
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const handleOpen = (index: number = 0) => {
    setCurrentIndex(index);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // ✅ Usa lo stesso normalizzatore della griglia: accetta sia picture.url che image?.[0]?.url
  const processedPictures = useMemo(() => {
    const flat = processGalleryImages(pictures); // => { id, title, url, alt }[]
    return flat.map((img, i) => [
      {
        id: img.id ?? `pic-${i}`,
        title: img.title ?? '',
        url: img.url,
        alt: img.alt ?? img.title ?? 'Immagine galleria',
      },
    ]);
  }, [pictures]);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleOpen(0)}
        aria-label={`Apri galleria completa con ${allImagesCount} foto`}
        disabled={processedPictures.length === 0}
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
