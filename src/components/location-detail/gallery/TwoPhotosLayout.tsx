'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface TwoPhotosLayoutProps {
  pictures: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  openLightbox: (index: number) => void;
}

const TwoPhotosLayout: React.FC<TwoPhotosLayoutProps> = ({
  pictures,
  hoveredIndex,
  setHoveredIndex,
  openLightbox,
}) => {
  const fallbackImage =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif';

  // ✅ Tracciamo le immagini che hanno fallito il load (per id)
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const markFailed = (id: string) => {
    setFailedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {pictures.map((picture, index) => {
        const failed = failedIds.has(picture.id);
        const src = failed ? fallbackImage : picture.url || fallbackImage;

        return (
          <div
            key={picture.id}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openLightbox(index)}
          >
            <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={src}
                alt={picture.alternativeText || picture.title || 'Location image'}
                fill
                sizes="50vw"
                className="object-cover transition-all duration-500 group-hover:scale-110"
                onError={() => {
                  // Log opzionale per debug
                  // console.error('🔍 LocationGallery - Image failed to load:', picture.url);
                  markFailed(picture.id);
                }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div
                className={`absolute bottom-4 left-4 right-4 transform transition-all duration-300 ${
                  hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}
              >
                <p className="text-white font-medium drop-shadow-lg">{picture.title}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TwoPhotosLayout;
