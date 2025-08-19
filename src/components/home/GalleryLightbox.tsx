'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

interface GalleryLightboxProps {
  isOpen: boolean;
  /** chiamato da Radix sia per aprire che per chiudere */
  onOpenChange: (open: boolean) => void;
  /** chiamato solo dal pulsante “X” */
  onClose: () => void;
  pictures: {
    id: string;
    title?: string;
    url: string;
    alt?: string;
  }[][];
  startIndex: number;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  pictures,
  startIndex,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [autoplay, setAutoplay] = useState(false);

  // Flatten and map images
  const allImages = useMemo(() => {
    return pictures
      .flatMap((picture) =>
        picture.map((img) => ({
          id: img.id,
          title: img.title,
          url: img.url,
          alt: img.alt,
        }))
      );
  }, [pictures]);

  const total = allImages.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    },
    [handleNext, handlePrev, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  useEffect(() => {
    if (!autoplay || !isOpen) return;
    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, isOpen]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  if (!total) return null;

  const currentImage = allImages[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        autoFocus
        role="dialog"
        aria-label="Galleria immagini a tutto schermo"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            aria-label="Chiudi galleria"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Autoplay */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoplay((prev) => !prev)}
            className="absolute top-4 left-4 z-10 text-white hover:bg-white/20"
            aria-label={autoplay ? 'Ferma autoplay' : 'Avvia autoplay'}
          >
            {autoplay ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          {/* Navigation Arrows */}
          {total > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                aria-label="Immagine precedente"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                aria-label="Immagine successiva"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Current Image */}
          <div
            {...swipeHandlers}
            className="relative max-w-full max-h-full p-8 touch-pan-x"
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              loading="lazy"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//viaggi-fotografici-e-workshop.avif';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center">
              <p className="text-lg">{currentImage.title}</p>
            </div>
          </div>

          {/* Counter */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {total}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
