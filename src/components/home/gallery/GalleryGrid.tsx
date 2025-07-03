'use client';

import React from 'react';
import GalleryImage from './GalleryImage';
import { ProcessedImage } from './types';

interface GalleryGridProps {
  images: ProcessedImage[];
  onImageClick: () => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <GalleryImage
          key={image.id}
          image={image}
          index={index}
          onClick={onImageClick}
        />
      ))}
    </div>
  );
};

export default GalleryGrid;
