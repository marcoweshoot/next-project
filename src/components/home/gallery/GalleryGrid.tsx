// src/components/gallery/GalleryGrid.tsx
import React from 'react';
import NextImage from 'next/image';
import type { GalleryGridProps } from '@/components/home/gallery/types';

const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {images.map((img, idx) => (
        <li
          key={img.id}
          role="listitem"
          className="overflow-hidden rounded-lg shadow-lg"
        >
          <button
            type="button"
            onClick={() => onImageClick?.(idx)}
            className="relative w-full aspect-square block"
          >
            <NextImage
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default GalleryGrid;
