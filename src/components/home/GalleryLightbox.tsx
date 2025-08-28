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
  const allImages = useMemo(
    () =>
      pictures.flatMap((picture) =>
        picture.map((img) => ({
          id: img.id,
          title: img.title,
          url: img.url,
          alt: img.alt,
        })),
      ),
    [pictures],
  );

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
    [handleNext, handlePrev, onClose],
  );

  // Clamp dell'indice quando si apre o cambiano input/numero immagini
  useEffect(() => {
    if (!isOpen) return;
    if (total === 0) {
      setCurrentIndex(0);
      return;
    }
    const next = Math.min(Math.max(0, startIndex), total - 1);
    setCurrentIndex(next);
  }, [isOpen, startIndex, total]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || !isOpen) return;
    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, isOpen]);

  // Stop autoplay alla chiusura
  useEffect(() => {
    if (!isOpen && autoplay) setAutoplay(false);
  }, [isOpen, autoplay]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  if (!total) return null;

  const currentImage = allImages[currentIndex];
  const altText = currentImage?.alt || currentImage?.title || 'Immagine galleria';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 dark:bg-black/95 focus:outline-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        autoFocus
        role="dialog"
        aria-label="Galleria immagini a tutto schermo"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Chiudi galleria"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Autoplay */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoplay((prev) => !prev)}
            className="absolute left-4 top-4 z-10 text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label={autoplay ? 'Ferma autoplay' : 'Avvia autoplay'}
          >
            {autoplay ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          {/* Navigation Arrows */}
          {total > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label="Immagine precedente"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label="Immagine successiva"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Current Image */}
          <div {...swipeHandlers} className="relative max-h-full max-w-full touch-pan-x p-8">
            <img
              src={currentImage.url}
              alt={altText}
              loading="lazy"
              className="max-h-full max-w-full object-contain transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/viaggi-fotografici-e-workshop.avif';
              }}
            />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-4 py-3 text-center">
              <p className="text-base text-primary-foreground">
                {currentImage.title || ' '}
              </p>
            </div>
          </div>

          {/* Counter */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-primary-foreground">
              {currentIndex + 1} / {total}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
