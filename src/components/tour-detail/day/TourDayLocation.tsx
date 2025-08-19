'use client';

import React from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface RawPicture {
  id?: string;
  title?: string;
  type?: string;
  image?: any;
}
interface NormalizedPicture {
  id?: string;
  title?: string;
  url: string;
  alternativeText: string;
}
interface DayLocation {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: RawPicture[];
}
interface TourDayLocationProps {
  location: DayLocation;
  onOpenLightbox: (pictures: NormalizedPicture[], startIndex?: number) => void;
  /** livello heading per la location (default: h5) */
  headingLevel?: 3 | 4 | 5 | 6;
}

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return b ? `${b}/${p}` : `/${p}`;
}
function toAbsolute(rawUrl: string): string {
  if (!rawUrl) return '';
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || '';
  return joinUrl(base, rawUrl);
}
function normalizeLocationPictures(pictures: RawPicture[] = []): NormalizedPicture[] {
  return pictures
    .filter((p) => p && (p.type === 'tour' || typeof p.type === 'undefined'))
    .flatMap((p) => {
      const arr = Array.isArray(p.image) ? p.image : [p.image];
      return arr
        .filter(Boolean)
        .map((img: any) => {
          const large = img?.formats?.large?.url;
          const thumb = img?.formats?.thumbnail?.url;
          const raw = large || img?.url || thumb || '';
          const url = toAbsolute(raw);
          return {
            id: img?.id || p.id,
            title: p.title || '',
            url,
            alternativeText: img?.alternativeText || p.title || '',
          };
        })
        .filter((n: NormalizedPicture) => !!n.url);
    });
}

const TourDayLocation: React.FC<TourDayLocationProps> = ({
  location,
  onOpenLightbox,
  headingLevel = 5,
}) => {
  const validPictures = React.useMemo(
    () => normalizeLocationPictures(location.pictures || []),
    [location.pictures]
  );

  const Hloc = `h${headingLevel}` as keyof JSX.IntrinsicElements;
  const headingId = `loc-h-${location.id}`;

  const renderMainImage = (picture: NormalizedPicture, index = 0) => (
    <button
      type="button"
      className="aspect-[16/10] overflow-hidden cursor-pointer group relative w-full"
      onClick={() => onOpenLightbox(validPictures, index)}
      aria-labelledby={headingId}
    >
      <div className="relative w-full h-full">
        <Image
          src={picture.url}
          alt={picture.alternativeText || picture.title || `Immagine ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={70}
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center" aria-hidden="true">
        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      {/* titolo visivo nell’overlay, non heading */}
      <div className="absolute bottom-4 left-4 right-4" aria-hidden="true">
        <span className="text-white font-bold text-lg drop-shadow-lg">{location.title}</span>
      </div>
    </button>
  );

  return (
    <article
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
      aria-labelledby={headingId}
    >
      {/* Heading semantico SR-only per la gerarchia */}
      {React.createElement(Hloc, { id: headingId, className: 'sr-only' }, location.title)}

      {validPictures.length === 1 && renderMainImage(validPictures[0])}

      {validPictures.length > 1 && (
        <>
          <div className="relative">
            {renderMainImage(validPictures[0])}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-10 flex items-center gap-1" aria-hidden="true">
              <Camera className="w-4 h-4 inline" />
              <span>{validPictures.length} foto</span>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {validPictures.slice(1, 4).map((picture, idx) => (
                <button
                  key={picture.id || idx}
                  type="button"
                  className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative w-full"
                  onClick={() => onOpenLightbox(validPictures, idx + 1)}
                  aria-label={`Apri foto ${idx + 2} di ${location.title}`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={picture.url}
                      alt={picture.alternativeText || picture.title || `Foto ${idx + 2}`}
                      fill
                      sizes="(max-width: 768px) 33vw, 16vw"
                      quality={65}
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </button>
              ))}

              {validPictures.length > 4 && (
                <button
                  type="button"
                  className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => onOpenLightbox(validPictures, 4)}
                  aria-label={`Apri altre ${validPictures.length - 4} foto di ${location.title}`}
                >
                  <span className="text-sm font-medium text-gray-600">
                    +{validPictures.length - 4}
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {validPictures.length === 0 && (
        <div className="p-6">
          {/* Visivo sì, ma non heading */}
          <p className="font-bold text-primary text-lg">{location.title}</p>
          {location.description && <p className="text-gray-600 text-sm mt-2">{location.description}</p>}
        </div>
      )}
    </article>
  );
};

export default TourDayLocation;
