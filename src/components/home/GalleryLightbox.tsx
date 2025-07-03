"use client"

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Picture {
  id: string;
  title: string;
  image: Array<{
    id: string;
    url: string;
    alternativeText?: string;
    caption?: string;
  }>;
}

interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  pictures: Array<{ node: Picture }>;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  isOpen,
  onClose,
  pictures
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Trasforma le foto in formato utilizzabile
  const allImages = pictures
    .map(picture => {
      const firstImage = picture.node.image && picture.node.image.length > 0 ? picture.node.image[0] : null;
      return firstImage ? {
        id: picture.node.id,
        title: picture.node.title,
        url: firstImage.url,
        alt: firstImage.alternativeText || picture.node.title
      } : null;
    })
    .filter(Boolean);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!allImages.length) return null;

  const currentImage = allImages[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation Buttons */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Current Image */}
          <div className="relative max-w-full max-h-full p-8">
            <img
              src={currentImage?.url}
              alt={currentImage?.alt}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center">
              <p className="text-lg">{currentImage?.title}</p>
            </div>
          </div>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
