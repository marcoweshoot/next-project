import { cn } from '@/lib/utils';
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
}: PageHeaderProps) => {
  const heightClasses = {
    small: 'min-h-[40vh]',
    medium: 'min-h-[60vh]',
    big: 'min-h-[75vh]',
  };

  if (plain) {
    return <div className={cn('py-20', className)}>{children}</div>;
  }

  const showVideo = Boolean(videoUrl);
  const showImage = !videoUrl && Boolean(backgroundImage);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden flex items-center justify-center px-4',
        heightClasses[size],
        className
      )}
    >
      {/* Video di sfondo (non pesa la rete prima del paint) */}
      {showVideo && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <video
            className="w-full h-full object-cover"
            loop
            muted
            autoPlay
            playsInline
            preload="none"
            poster={backgroundImage}
          >
            <source src={videoUrl!} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Immagine di sfondo */}
      {showImage && backgroundImage && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src={backgroundImage}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
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
