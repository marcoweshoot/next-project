import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PageHeaderProps {
  children: React.ReactNode;
  plain?: boolean;
  theme?: 'light' | 'dark';
  videoUrl?: string; // es: URL da Supabase
  backgroundImage?: string; // es: URL da GraphQL
  size?: 'small' | 'medium' | 'big';
  className?: string;
}

const PageHeader = ({
  children,
  plain = false,
  theme = 'dark',
  videoUrl,
  backgroundImage,
  size = 'big',
  className
}: PageHeaderProps) => {
  const sizeClasses = {
    small: 'py-24',
    medium: 'py-32',
    big: 'py-40',
  };

  if (plain) {
    return (
      <div className={cn('py-20', className)}>
        {children}
      </div>
    );
  }

  const showVideo = Boolean(videoUrl);
  const showImage = !videoUrl && Boolean(backgroundImage);

  return (
    <div className={cn('relative overflow-hidden', sizeClasses[size], className)}>
      {/* Video di sfondo */}
      {showVideo && (
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            loop
            muted
            autoPlay
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Immagine di sfondo */}
      {showImage && backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Sfondo pagina"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 z-20" />

      {/* Contenuto */}
      <div className="relative z-30">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
