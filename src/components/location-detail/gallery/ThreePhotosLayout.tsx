'use client';

import React from 'react';

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
  openLightbox
}) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
  const [mainPicture, ...sidePictures] = pictures;

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
          <img
            src={mainPicture.url || fallbackImage}
            alt={mainPicture.alternativeText || mainPicture.title || 'Location image'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              console.error("🔍 LocationGallery - Main image failed to load:", mainPicture.url);
              const target = e.target as HTMLImageElement;
              target.src = fallbackImage;
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 ${
            hoveredIndex === 0 ? 'opacity-100' : 'opacity-0'
          }`} />
          <div className={`absolute bottom-6 left-6 right-6 transform transition-all duration-300 ${
            hoveredIndex === 0 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}>
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
              <img
                src={picture.url || fallbackImage}
                alt={picture.alternativeText || picture.title || 'Location image'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  console.error("🔍 LocationGallery - Side image failed to load:", picture.url);
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImage;
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${
                hoveredIndex === index + 1 ? 'opacity-100' : 'opacity-0'
              }`} />
              <div className={`absolute bottom-3 left-3 right-3 transform transition-all duration-300 ${
                hoveredIndex === index + 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}>
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
