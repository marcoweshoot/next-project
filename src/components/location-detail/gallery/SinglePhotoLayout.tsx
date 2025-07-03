'use client';

import React from 'react';

interface SinglePhotoLayoutProps {
  picture: {
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  };
  openLightbox: () => void;
}

const SinglePhotoLayout: React.FC<SinglePhotoLayoutProps> = ({ picture, openLightbox }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

  return (
    <div className="relative group cursor-pointer" onClick={openLightbox}>
      <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        <img
          src={picture.url || fallbackImage}
          alt={picture.alternativeText || picture.title || 'Location image'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            console.error("🔍 LocationGallery - Image failed to load:", picture.url);
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
          <p className="text-white text-lg font-medium drop-shadow-lg">{picture.title}</p>
        </div>
      </div>
    </div>
  );
};

export default SinglePhotoLayout;
