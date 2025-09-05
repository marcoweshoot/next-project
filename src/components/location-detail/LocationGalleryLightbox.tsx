'use client';

import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';

interface LocationGalleryLightboxProps {
  pictures: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const LocationGalleryLightbox: React.FC<LocationGalleryLightboxProps> = ({
  pictures,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const total = Array.isArray(pictures) ? pictures.length : 0;

  // Indice e foto correnti, calcolati in modo sicuro
  const currentPicture = useMemo(() => {
    if (!total) return undefined;
    const idx = Math.min(Math.max(currentIndex, 0), total - 1);
    return pictures[idx];
  }, [pictures, currentIndex, total]);

  // Focus sul contenitore per accessibilità
  useEffect(() => {
    contentRef.current?.focus();
  }, []);

  // Keybindings globali (← → Esc)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onNext, onPrev, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Preload immagini adiacenti
  useEffect(() => {
    if (!total) return;
    const preload = (i: number) => {
      const url = pictures[i]?.url;
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    };
    preload((currentIndex + 1) % total);
    preload((currentIndex - 1 + total) % total);
  }, [currentIndex, pictures, total]);

  if (!currentPicture) return null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none focus:outline-none">
        <div
          ref={contentRef}
          tabIndex={-1}
          className="relative w-full h-full flex items-center justify-center outline-none"
          aria-label="Lightbox galleria immagini"
        >
          {/* Pulsante chiudi */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
            aria-label="Chiudi lightbox"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigazione */}
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

          {/* Immagine corrente */}
          <div className="relative max-w-full max-h-full p-8 w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={currentPicture.url}
                alt={
                  currentPicture.alternativeText ||
                  currentPicture.title ||
                  'Immagine della galleria'
                }
                fill
                className="object-contain select-none"
                draggable={false}
                sizes="100vw"
                priority
              />
            </div>
            {(currentPicture.title || currentPicture.alternativeText) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center">
                <p className="text-lg font-medium">
                  {currentPicture.title || currentPicture.alternativeText}
                </p>
              </div>
            )}
          </div>

          {/* Contatore */}
          {total > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
              aria-live="polite"
            >
              {currentIndex + 1} / {total}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function arePropsEqual(
  prev: LocationGalleryLightboxProps,
  next: LocationGalleryLightboxProps
) {
  if (prev.currentIndex !== next.currentIndex) return false;
  if (prev.onClose !== next.onClose) return false;
  if (prev.onNext !== next.onNext) return false;
  if (prev.onPrev !== next.onPrev) return false;

  const a = prev.pictures;
  const b = next.pictures;
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

LocationGalleryLightbox.displayName = 'LocationGalleryLightbox';

export default React.memo(LocationGalleryLightbox, arePropsEqual);
