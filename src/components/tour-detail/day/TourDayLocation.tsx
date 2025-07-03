'use client';

import React from 'react';
import { Camera } from 'lucide-react';

interface DayLocation {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
}

interface TourDayLocationProps {
  location: DayLocation;
  onOpenLightbox: (pictures: Array<{id: string; title: string; url: string; alternativeText: string;}>, startIndex?: number) => void;
}

const TourDayLocation: React.FC<TourDayLocationProps> = ({ location, onOpenLightbox }) => {
  console.log("TourDayLocation: Processing location", location.title, "with pictures:", location.pictures);
  
  // Filtra le immagini valide
  const validPictures = location.pictures?.filter(picture => 
    picture && picture.url && typeof picture.url === 'string' && picture.url.length > 0
  ) || [];
  
  console.log("TourDayLocation: Valid pictures for", location.title, ":", validPictures.length);
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
      {/* Caso: foto singola */}
      {validPictures.length === 1 && (
        <div className="relative">
          <div 
            className="aspect-[16/10] overflow-hidden cursor-pointer group"
            onClick={() => onOpenLightbox(validPictures, 0)}
          >
            <img
              src={validPictures[0].url}
              alt={validPictures[0].alternativeText}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                console.error("Failed to load image:", validPictures[0].url);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Hover effect per indicare che è cliccabile */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Titolo sovrapposto */}
            <div className="absolute bottom-4 left-4 right-4">
              <h6 className="text-white font-bold text-lg drop-shadow-lg">
                {location.title}
              </h6>
            </div>
          </div>
        </div>
      )}

      {/* Caso: foto multiple */}
      {validPictures.length > 1 && (
        <>
          {/* Foto principale */}
          <div className="relative">
            <div 
              className="aspect-[16/10] overflow-hidden cursor-pointer group"
              onClick={() => onOpenLightbox(validPictures, 0)}
            >
              <img
                src={validPictures[0].url}
                alt={validPictures[0].alternativeText}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  console.error("Failed to load main image:", validPictures[0].url);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Badge con numero di foto */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                <Camera className="w-4 h-4 inline mr-1" />
                {validPictures.length} foto
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Titolo sovrapposto */}
              <div className="absolute bottom-4 left-4 right-4">
                <h6 className="text-white font-bold text-lg drop-shadow-lg">
                  {location.title}
                </h6>
              </div>
            </div>
          </div>
          
          {/* Galleria di anteprima */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {validPictures.slice(1, 4).map((picture, idx) => (
                <div 
                  key={picture.id} 
                  className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => onOpenLightbox(validPictures, idx + 1)}
                >
                  <img
                    src={picture.url}
                    alt={picture.alternativeText}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      console.error("Failed to load preview image:", picture.url);
                    }}
                  />
                </div>
              ))}
              {validPictures.length > 4 && (
                <div 
                  className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => onOpenLightbox(validPictures, 4)}
                >
                  <span className="text-sm font-medium text-gray-600">
                    +{validPictures.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Caso: nessuna foto */}
      {validPictures.length === 0 && (
        <div className="p-6">
          <h6 className="font-bold text-primary text-lg">
            {location.title}
          </h6>
          {location.description && (
            <p className="text-gray-600 text-sm mt-2">
              {location.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TourDayLocation;
