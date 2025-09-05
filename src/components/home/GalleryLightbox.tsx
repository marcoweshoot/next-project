'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';

interface GalleryLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // Radix open/close
  onClose: () => void;                   // ESC o bottone custom
  pictures: { id: string; title?: string; url: string; alt?: string }[][];
  startIndex: number;
  dialogTitle?: string;
}

const FALLBACK_SRC =
  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/viaggi-fotografici-e-workshop.avif';

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  pictures,
  startIndex,
  dialogTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [hadError, setHadError] = useState(false);

  // Flatten immagini
  const allImages = useMemo(
    () =>
      pictures.flatMap((group) =>
        group.map((img) => ({
          id: img.id,
          title: img.title ?? '',
          url: img.url,
          alt: img.alt ?? img.title ?? '',
        })),
      ),
    [pictures]
  );

  const total = allImages.length;

  const handleNext = useCallback(() => {
    setHadError(false);
    setCurrentIndex((p) => (p + 1) % Math.max(total, 1));
  }, [total]);

  const handlePrev = useCallback(() => {
    setHadError(false);
    setCurrentIndex((p) => (p - 1 + Math.max(total, 1)) % Math.max(total, 1));
  }, [total]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    },
    [handleNext, handlePrev, onClose]
  );

  // Allinea l'indice quando si apre/cambia lista
  useEffect(() => {
    if (!isOpen) return;
    if (!total) return setCurrentIndex(0);
    setCurrentIndex(Math.min(Math.max(0, startIndex), total - 1));
    setHadError(false);
  }, [isOpen, startIndex, total]);

  if (!total) return null;

  const currentImage = allImages[currentIndex];
  const altText = currentImage.alt || currentImage.title || 'Immagine galleria';
  const src = hadError ? FALLBACK_SRC : currentImage.url;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] h-[95vh] max-w-none p-0 bg-black/90 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Titolo A11y nascosto */}
        <VisuallyHidden>
          <DialogTitle>{dialogTitle || currentImage?.title || 'Galleria immagini'}</DialogTitle>
          <DialogDescription>
            Immagine {currentIndex + 1} di {total}. Usa ←/→ per navigare, Esc per chiudere.
          </DialogDescription>
        </VisuallyHidden>

        {/* X custom, sempre visibile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 text-white/90 hover:bg-white/10"
          aria-label="Chiudi galleria"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Frecce */}
        {total > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/90 hover:bg-white/10"
              aria-label="Immagine precedente"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/90 hover:bg-white/10"
              aria-label="Immagine successiva"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Area immagine */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
          {/* Container relativo per <Image fill /> */}
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={altText}
              fill
              sizes="100vw"
              className="object-contain select-none"
              draggable={false}
              loading="lazy"
              onError={() => setHadError(true)}
            />
          </div>

          {/* Caption sovrapposta */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3 text-center">
            <p className="text-base text-white">{currentImage.title || ' '}</p>
          </div>

          {/* Counter in alto */}
          {total > 1 && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white z-20">
              {currentIndex + 1} / {total}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
