
import React from 'react';
import { Picture } from '@/types';

interface CourseTeacherPhotosProps {
  pictures: Picture[];
}

const CourseTeacherPhotos: React.FC<CourseTeacherPhotosProps> = ({ pictures }) => {
  if (!pictures || pictures.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Alcune delle mie foto
          </h2>
          <p className="text-xl text-gray-600">
            Nei miei corsi di fotografia ti insegnerò a fare fotografie come queste
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pictures.slice(0, 6).map((picture) => {
            // Get the first image from the array since image is an array
            const imageData = picture.image?.[0];
            
            if (!imageData?.url) {
              console.warn('CourseTeacherPhotos: Missing image data for picture:', picture.id);
              return null;
            }
            
            return (
              <div key={picture.id} className="aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={imageData.url}
                  alt={imageData.alternativeText || picture.title || 'Foto del teacher'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onLoad={() => console.log(`CourseTeacherPhotos: Image ${picture.id} loaded successfully`)}
                  onError={(e) => {
                    console.error(`CourseTeacherPhotos: Error loading image for picture ${picture.id}:`, e);
                    console.error(`CourseTeacherPhotos: Failed URL:`, imageData.url);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseTeacherPhotos;
