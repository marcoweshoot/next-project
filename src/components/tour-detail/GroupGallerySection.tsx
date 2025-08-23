// src/components/tour-detail/GroupGallerySection.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import GalleryEmptyState from './gallery/GalleryEmptyState';
import GalleryCarousel from './gallery/GalleryCarousel';

const GalleryLightbox = dynamic(() => import('./gallery/GalleryLightbox'), {
  ssr: false,
});

interface GalleryImage {
  id?: string;
  url: string;
  alternativeText?: string;
  caption?: string;
}

interface GroupGallerySectionProps {
  gallery?: any[];
  title?: string;
  subtitle?: string;
}

/** Join base+path senza doppio slash */
function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** Rende assoluto l'URL se è relativo (es. /uploads/...) */
function toAbsoluteUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || '';
  return joinUrl(base, rawUrl);
}

/** Normalizza qualunque shape di picture in una lista di immagini */
function normalizeGroupImages(gallery: any[] = []): GalleryImage[] {
  // 1) tieni SOLO i record con type === 'group'
  const onlyGroup = gallery.filter(
    (p) => String(p?.type || '').toLowerCase() === 'group'
  );

  // 2) estrai immagini sia top-level (url) sia annidate (image / images)
  const out: GalleryImage[] = [];

  for (const pic of onlyGroup) {
    // a) formato "nuovo": url a livello top
    if (pic?.url) {
      out.push({
        id: String(pic.id ?? pic.url),
        url: toAbsoluteUrl(pic.url),
        alternativeText: pic.alt || pic.alternativeText || '',
        caption: pic.title || '',
      });
    }

    // b) formato "vecchio": image singolo / array, o images[]
    const rawImages = Array.isArray(pic?.image)
      ? pic.image
      : Array.isArray(pic?.images)
      ? pic.images
      : pic?.image
      ? [pic.image]
      : [];

    for (const img of rawImages) {
      const url = toAbsoluteUrl(
        img?.formats?.large?.url || img?.url || img?.formats?.thumbnail?.url || ''
      );
      if (!url) continue;

      out.push({
        id: String(img?.id ?? pic?.id ?? url),
        url,
        alternativeText: img?.alternativeText || pic?.title || '',
        caption: img?.caption || pic?.title || '',
      });
    }
  }

  // 3) filtra invalide e de-duplica per URL
  const seen = new Set<string>();
  return out
    .filter((it) => !!it.url)
    .filter((img) => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
}

const GroupGallerySection: React.FC<GroupGallerySectionProps> = ({
  gallery,
  title = 'E tu sei pronto a viaggiare con nuovi amici come te?',
  subtitle = 'Vivi insieme ai tuoi nuovi amici WeShooters questi momenti indimenticabili',
}) => {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images: GalleryImage[] = React.useMemo(() => {
    if (!Array.isArray(gallery) || gallery.length === 0) return [];
    return normalizeGroupImages(gallery);
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

  // 👉 se non ci sono foto "group", puoi:
  // - mostrare l'empty state (comportamento attuale)
  // - oppure ritornare null per nascondere completamente la sezione.
  if (images.length === 0) {
    //return <GalleryEmptyState />;
    return null;
  }

  return (
    <>
      <section id="group-gallery" className="py-16 px-4 md:px-0">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        <GalleryCarousel images={images} onImageClick={openLightbox} />
      </section>

      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        images={images}
        currentIndex={currentImageIndex}
        onNext={nextImage}
        onPrev={prevImage}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};

export default GroupGallerySection;
