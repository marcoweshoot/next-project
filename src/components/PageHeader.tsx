import { cn } from '@/lib/utils';
import { getFullMediaUrl } from '@/utils/TourDataUtilis'; // <-- aggiorna il path se necessario
import Image from 'next/image';
import React from 'react';

interface PageHeaderProps {
  children: React.ReactNode;
  plain?: boolean;
  theme?: 'light' | 'dark';
  videoUrl?: string;
  backgroundImage?: string;
  size?: 'small' | 'medium' | 'big';
  className?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

const PageHeader = ({
  children,
  plain = false,
  theme = 'dark',
  videoUrl,
  backgroundImage,
  size = 'medium',
  className,
  alt = '',
  priority = false,
  sizes = '100vw',
  quality,
}: PageHeaderProps) => {
  const heightClasses = {
    small: 'min-h-[40vh]',
    medium: 'min-h-[60vh]',
    big: 'min-h-[75vh]',
  };

  if (plain) {
    return <div className={cn('py-20', className)}>{children}</div>;
  }

  // Normalizza gli URL per evitare 400 dall'image optimizer
  const normalizedVideoUrl = videoUrl ? getFullMediaUrl(videoUrl) : undefined;
  const normalizedBgImage = backgroundImage ? getFullMediaUrl(backgroundImage) : undefined;

  const showVideo = Boolean(normalizedVideoUrl);
  const showImage = !showVideo && Boolean(normalizedBgImage);

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
            poster={normalizedBgImage}
          >
            <source src={normalizedVideoUrl!} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Immagine di sfondo */}
      {showImage && normalizedBgImage && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src={normalizedBgImage}
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
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Contenuto */}
      <div className="relative z-20 w-full max-w-7xl text-center">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
