'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ThreePhotosLayoutProps {
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

const ThreePhotosLayout: React.FC<ThreePhotosLayoutProps> = ({
  pictures,
  hoveredIndex,
  setHoveredIndex,
  openLightbox,
}) => {
  const fallbackImage =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif';

  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const [mainPicture, ...sidePictures] = pictures;

  const getSrc = (id: string, url?: string) =>
    failed[id] ? fallbackImage : (url || fallbackImage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main large photo */}
      <div
        className="lg:col-span-2 relative group cursor-pointer"
        onMouseEnter={() => setHoveredIndex(0)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => openLightbox(0)}
      >
        <div className="relative h-72 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={getSrc(mainPicture.id, mainPicture.url)}
            alt={mainPicture.alternativeText || mainPicture.title || 'Location image'}
            fill
            sizes="(max-width:1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => {
              console.error('🔍 LocationGallery - Main image failed to load:', mainPicture.url);
              setFailed((f) => ({ ...f, [mainPicture.id]: true }));
            }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 ${
              hoveredIndex === 0 ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute bottom-6 left-6 right-6 transform transition-all duration-300 ${
              hoveredIndex === 0 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <p className="text-white text-lg font-medium drop-shadow-lg">{mainPicture.title}</p>
          </div>
        </div>
      </div>

      {/* Side photos */}
      <div className="space-y-6">
        {sidePictures.map((picture, index) => (
          <div
            key={picture.id}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index + 1)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openLightbox(index + 1)}
          >
            <div className="relative h-32 lg:h-60 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={getSrc(picture.id, picture.url)}
                alt={picture.alternativeText || picture.title || 'Location image'}
                fill
                sizes="(max-width:1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => {
                  console.error('🔍 LocationGallery - Side image failed to load:', picture.url);
                  setFailed((f) => ({ ...f, [picture.id]: true }));
                }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${
                  hoveredIndex === index + 1 ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div
                className={`absolute bottom-3 left-3 right-3 transform transition-all duration-300 ${
                  hoveredIndex === index + 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}
              >
                <p className="text-white text-sm font-medium drop-shadow-lg">{picture.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreePhotosLayout;
