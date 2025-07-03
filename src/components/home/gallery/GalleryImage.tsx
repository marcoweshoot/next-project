'use client';

import React from 'react';
import { ProcessedImage } from './types';

interface GalleryImageProps {
  image: ProcessedImage;
  index: number;
  onClick: () => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ image, index, onClick }) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <img
        src={image.url}
        alt={image.alt}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          console.error("Image failed to load:", image.url);
          e.currentTarget.src = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
        }}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="text-white text-sm font-medium text-center px-2">
          {image.title}
        </span>
      </div>
    </div>
  );
};

export default GalleryImage;
