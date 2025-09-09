// components/course-detail/CourseTeacherPhotos.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getFullMediaUrl } from '@/utils/TourDataUtilis';

type PictureImage = {
  id: string;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
};

type Picture = {
  id: string;
  title?: string;
  image: PictureImage[];
};

interface CourseTeacherPhotosProps {
  pictures: Picture[];
}

const toSrc = (u?: string) =>
  u ? (/^https?:\/\//i.test(u) ? u : getFullMediaUrl(u)) : '';

const FALLBACK =
  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif';

const CourseTeacherPhotos: React.FC<CourseTeacherPhotosProps> = ({ pictures }) => {
  // Preparo la gallery (max 6 foto per non appesantire)
  const gallery = useMemo(
    () =>
      (pictures || [])
        .slice(0, 6)
        .flatMap((picture) =>
          (picture.image || []).map((img, idx) => {
            const raw = img?.url;
            const src = toSrc(raw) || FALLBACK;
            const alt =
              img?.alternativeText || picture.title || 'Foto del teacher';
            return {
              id: `${picture.id}-${idx}`,
              src,
              alt,
            };
          })
        )
        .filter(Boolean) as { id: string; src: string; alt: string }[],
    [pictures]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const open = useCallback(
    (i: number) => {
      if (!gallery.length) return;
      setIndex(i);
      setIsOpen(true);
    },
    [gallery.length]
  );

  const close = useCallback(() => setIsOpen(false), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + gallery.length) % gallery.length),
    [gallery.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % gallery.length),
    [gallery.length]
  );

  // ESC e frecce da tastiera + blocco scroll body
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, prev, next]);

  if (!gallery.length) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Alcune delle mie foto
          </h2>
          <p className="text-xl text-muted-foreground">
            Nei miei corsi di fotografia ti insegnerò a fare fotografie come queste
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map(({ id, src, alt }, i) => (
            <button
              key={id}
              type="button"
              onClick={() => open(i)}
              className="relative w-full aspect-square overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Apri immagine ${i + 1}`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                {...(i < 2 ? { priority: true } : {})}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
        >
          {/* Chiudi cliccando sullo sfondo */}
          <div
            className="absolute inset-0"
            onClick={close}
            aria-hidden="true"
          />

          {/* Contenitore immagine */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl h-[60vh] md:h-[80vh]">
              <Image
                src={gallery[index].src}
                alt={gallery[index].alt}
                fill
                sizes="100vw"
                className="object-contain select-none"
                priority
                draggable={false}
              />
            </div>

            {/* Contatore */}
            <div className="absolute bottom-4 left-1/2 z-[102] -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {index + 1}/{gallery.length}
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={close}
              aria-label="Chiudi"
              className="absolute right-4 top-4 z-[102] rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ✕
            </button>

            {/* Prev */}
            <button
              type="button"
              onClick={prev}
              aria-label="Immagine precedente"
              className="absolute left-2 md:left-4 top-1/2 z-[102] -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl leading-none text-white backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ‹
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={next}
              aria-label="Immagine successiva"
              className="absolute right-2 md:right-4 top-1/2 z-[102] -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl leading-none text-white backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ›
            </button>
          </div>
    </div>
      )}
    </section>
  );
};

export default CourseTeacherPhotos;
