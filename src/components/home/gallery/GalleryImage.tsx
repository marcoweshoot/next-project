'use client';

import React from 'react';
import Image from 'next/image';
import { FALLBACKS } from '@/constants/fallbacks';

interface GalleryImageProps {
  image: {
    id: string;
    url?: string;
    alternativeText?: string;
    title?: string;
    formats?: Record<string, { url: string }>;
  }[]; // 👈 l'immagine è un array
  index: number;
  onClick?: () => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ image, index, onClick }) => {
  const firstImage = Array.isArray(image) ? image[0] : undefined;

  // Estraggo solo i formati che mi interessano
  const thumbnailUrl = firstImage?.formats?.thumbnail?.url;
  const largeUrl = firstImage?.formats?.large?.url;

  const imageUrl =
    largeUrl ||
    thumbnailUrl ||
    firstImage?.url ||
    FALLBACKS.GALLERY_IMAGE;

  const altText =
    firstImage?.alternativeText ||
    firstImage?.title ||
    'Foto galleria';

  return (
    <div
      className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <Image
        src={imageUrl}
        alt={altText}
        width={400}
        height={400}
        className="object-cover group-hover:scale-110 transition-transform duration-500"
        sizes="(max-width: 768px) 100vw, 33vw"
        loading={index > 5 ? 'lazy' : 'eager'}
        priority={index < 6}
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="text-white text-sm font-medium text-center px-2">
          {firstImage?.title}
        </span>
      </div>
    </div>
  );
};

export default GalleryImage;
