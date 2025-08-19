'use client';

import React from 'react';

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
  openLightbox
}) => {
  const fallbackImage = 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {pictures.map((picture, index) => (
        <div 
          key={picture.id} 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => openLightbox(index)}
        >
          <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={picture.url || fallbackImage}
              alt={picture.alternativeText || picture.title || 'Location image'}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              onError={(e) => {
                console.error("🔍 LocationGallery - Image failed to load:", picture.url);
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${
              hoveredIndex === index ? 'opacity-100' : 'opacity-0'
            }`} />
            <div className={`absolute bottom-4 left-4 right-4 transform transition-all duration-300 ${
              hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}>
              <p className="text-white font-medium drop-shadow-lg">{picture.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TwoPhotosLayout;
