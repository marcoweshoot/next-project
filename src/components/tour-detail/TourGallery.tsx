'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import GalleryEmptyState from './gallery/GalleryEmptyState';
import GalleryCarousel from './gallery/GalleryCarousel';

const GalleryLightbox = dynamic(() => import('./gallery/GalleryLightbox'), { ssr: false });

interface GalleryImage {
  id?: string;
  url: string;
  alternativeText?: string;
  caption?: string;
}

interface TourGalleryProps {
  gallery?: any[];
  title?: string;
  subtitle?: string;
}

/** join base+path senza doppi slash */
function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** rende assoluto un URL relativo (es. /uploads/...) */
function toAbsoluteUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || '';
  return joinUrl(base, rawUrl);
}

const TourGallery: React.FC<TourGalleryProps> = ({
  gallery,
  title = 'Sei pronto a scattare foto come queste?',
  subtitle =
    'I coach ti porteranno in questi posti e ti insegneranno a scattare queste foto con la tua macchina fotografica',
}) => {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images: GalleryImage[] = React.useMemo(() => {
    if (!Array.isArray(gallery) || gallery.length === 0) return [];

    // type === 'tour' (case-insensitive), fallback a tutto
    const tourPics = gallery.filter((p) => String(p?.type || '').toLowerCase() === 'tour');
    const pics = tourPics.length ? tourPics : gallery;

    // normalizza image/images
    const normalized: GalleryImage[] = pics.flatMap((pic: any) => {
      const rawImages = Array.isArray(pic?.image)
        ? pic.image
        : Array.isArray(pic?.images)
        ? pic.images
        : pic?.image
        ? [pic.image]
        : [];

      return rawImages.filter(Boolean).map((img: any) => ({
        id: String(img?.id ?? pic?.id ?? ''),
        url: toAbsoluteUrl(img?.url || ''),
        alternativeText: img?.alternativeText || img?.alternative_text || '',
        caption: img?.caption || pic?.title || '',
      }));
    });

    return normalized.filter((it) => !!it.url);
  }, [gallery]);

  const openLightbox = React.useCallback(
    (index: number) => {
      if (!images.length) return;
      const safe = Math.max(0, Math.min(index, images.length - 1));
      setCurrentImageIndex(safe);
      setLightboxOpen(true);
    },
    [images.length]
  );

  const closeLightbox = React.useCallback(() => setLightboxOpen(false), []);
  const nextImage = React.useCallback(
    () => setCurrentImageIndex((i) => (i + 1) % images.length),
    [images.length]
  );
  const prevImage = React.useCallback(
    () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    },
    [nextImage, prevImage, closeLightbox]
  );

  if (images.length === 0) return <GalleryEmptyState />;

  return (
    <>
      <section id="tour-gallery" className="py-16 px-4 md:px-0">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">{title}</h2>
        <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        <GalleryCarousel images={images} onImageClick={openLightbox} />
      </section>

      {lightboxOpen && (
        <GalleryLightbox
          isOpen
          onClose={closeLightbox}
          images={images}
          currentIndex={currentImageIndex}
          onNext={nextImage}
          onPrev={prevImage}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
};

export default TourGallery;
