'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';

// opzionale: puoi anche usare VisuallyHidden
// import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; alternativeText?: string; caption?: string }>;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrev,
  onKeyDown,
}) => {
  const total = images.length;
  const currentImage =
    images[currentIndex] || { url: '', alternativeText: '', caption: '' };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="w-[95vw] max-w-[1200px] h-[90vh] p-0 bg-black/95 border-none overflow-hidden"
        onKeyDown={onKeyDown}
        tabIndex={0}
        autoFocus
        aria-label="Galleria immagini a tutto schermo"
      >
        {/* Titolo/descrizione richiesti da Radix (possono essere nascosti) */}
        <DialogHeader className="sr-only">
          <DialogTitle>Galleria immagini</DialogTitle>
          <DialogDescription>
            Lightbox del tour. Usa frecce per navigare.
          </DialogDescription>
        </DialogHeader>
        {/* In alternativa:
        <VisuallyHidden>
          <DialogTitle>Galleria immagini</DialogTitle>
        </VisuallyHidden>
        */}

        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
            aria-label="Chiudi galleria"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation Buttons */}
          {total > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={onPrev}
                aria-label="Immagine precedente"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={onNext}
                aria-label="Immagine successiva"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Current Image */}
          <div className="relative max-w-full max-h-full p-8 flex items-center justify-center w-full h-full">
            <div className="relative w-full h-full">
              <Image
                src={currentImage.url}
                alt={
                  currentImage.alternativeText ||
                  `Gallery image ${currentIndex + 1}`
                }
                fill
                sizes="100vw"
                className="object-contain"
                draggable={false}
                loading="lazy"
              />
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 flex justify-between items-center gap-4">
              <p className="text-lg truncate max-w-[70%]" aria-label="Titolo immagine">
                {currentImage.caption || ''}
              </p>
              {total > 1 && (
                <div className="text-sm flex-shrink-0" aria-label="Contatore immagini">
                  {currentIndex + 1} / {total}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
