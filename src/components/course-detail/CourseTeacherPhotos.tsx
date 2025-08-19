import React from 'react';
import NextImage from 'next/image';
import { getFullMediaUrl } from '@/utils/TourDataUtilis';
import { Picture } from '@/types';

interface CourseTeacherPhotosProps {
  pictures: Picture[];
}

const CourseTeacherPhotos: React.FC<CourseTeacherPhotosProps> = ({ pictures }) => {
  if (!pictures || pictures.length === 0) return null;

  // Prendiamo al massimo 6 foto
  const gallery = pictures
    .slice(0, 6)
    .flatMap((picture) =>
      // Su Strapi, picture.image è l'array delle immagini
    (picture.image || []).map((img, idx) => {

        if (!img?.url) return null;

        const src = getFullMediaUrl(img.url);
        const alt = img.alternativeText || picture.title || 'Foto del teacher';

        return {
          id: `${picture.id}-${idx}`,
          src,
          alt,
        };
      })
    )
    .filter((img): img is { id: string; src: string; alt: string } => Boolean(img));

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
          {gallery.map(({ id, src, alt }, index) => (
            <div
              key={id}
              className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <NextImage
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                {...(index < 2 ? { priority: true } : {})}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseTeacherPhotos;
