import { cn } from '@/lib/utils';
import { getFullMediaUrl } from '@/utils/TourDataUtilis';
import Image, { type StaticImageData } from 'next/image';
import React from 'react';

interface PageHeaderProps {
  children: React.ReactNode;
  plain?: boolean;
  theme?: 'light' | 'dark';
  videoUrl?: string;
  backgroundImage?: string | StaticImageData; // supporta stringa o import statico
  size?: 'small' | 'medium' | 'big';
  className?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

const isHttp = (s: string) => /^https?:\/\//i.test(s);
const isLocalPath = (s: string) => s.startsWith('/');
const isStaticImport = (x: unknown): x is StaticImageData =>
  !!x && typeof x === 'object' && 'src' in (x as any);

function normalizeMedia(input?: string | StaticImageData) {
  if (!input) return undefined;
  if (typeof input !== 'string') return input;           // StaticImport
  if (isLocalPath(input) || isHttp(input)) return input; // locale o assoluto
  return getFullMediaUrl(input);                         // path CMS relativo
}

const PageHeader = ({
  children,
  plain = false,
  theme = 'dark',
  videoUrl,
  backgroundImage,
  size = 'medium',
  className,
  alt = 'Hero background',
  priority = false,
  sizes = '100vw',
  quality,
}: PageHeaderProps) => {
  const heightClasses = {
    small: 'min-h-[40vh]',
    medium: 'min-h-[60vh]',
    big: 'min-h-[75vh]',
  };

  if (plain) return <div className={cn('py-20', className)}>{children}</div>;

  const normalizedVideoUrl =
    typeof videoUrl === 'string'
      ? (isLocalPath(videoUrl) || isHttp(videoUrl)) ? videoUrl : getFullMediaUrl(videoUrl)
      : undefined;

  const normalizedBg = normalizeMedia(backgroundImage);

  const showVideo = Boolean(normalizedVideoUrl);
  const showImage = !showVideo && Boolean(normalizedBg);

  const overlayClass =
    theme === 'dark'
      ? 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
      : 'bg-gradient-to-t from-black/40 via-black/20 to-transparent';

  // Scelte di rendering:
  const bgIsStatic = isStaticImport(normalizedBg);
  const bgIsLocalString = typeof normalizedBg === 'string' && isLocalPath(normalizedBg);
  const bgIsRemoteString = typeof normalizedBg === 'string' && !isLocalPath(normalizedBg);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden flex items-center justify-center px-4',
        heightClasses[size],
        className
      )}
    >
      {/* Video di sfondo */}
      {showVideo && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <video
            className="w-full h-full object-cover"
            loop
            muted
            autoPlay
            playsInline
            preload="none"
            poster={bgIsLocalString ? (normalizedBg as string) : undefined}
          >
            <source src={normalizedVideoUrl!} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Immagine di sfondo:
          - StaticImport => <Image> (ottimizzato, ok)
          - Stringa locale (/public) => CSS background (nessun optimizer)
          - Stringa remota => <Image> (optimizer) */}
      {showImage && bgIsStatic && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src={normalizedBg as StaticImageData}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            quality={quality}
            className="object-cover"
          />
        </div>
      )}

      {showImage && bgIsLocalString && (
        <div
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${normalizedBg as string}')` }}
          aria-label={alt}
          role="img"
        />
      )}

      {showImage && bgIsRemoteString && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src={normalizedBg as string}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            quality={quality}
            className="object-cover"
          />
        </div>
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 z-10 ${overlayClass}`} />

      {/* Contenuto */}
      <div className="relative z-20 w-full max-w-7xl text-center">{children}</div>
    </div>
  );
};

export default PageHeader;
