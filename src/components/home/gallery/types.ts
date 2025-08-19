// src/components/home/gallery/types.ts

/** Immagine singola da Strapi */
export interface ImageData {
  id: string;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url?: string; width?: number; height?: number; size?: number };
    large?: { url?: string; width?: number; height?: number; size?: number };
  };
}

/** Foto/immagine con metadati, collegata a un viaggio o evento */
export interface Picture {
  id: string;
  title: string;
  type?: string;
  image: ImageData[]; // sempre array per coerenza
}

/** Props per la GallerySection nella homepage */
export interface GallerySectionProps {
  pictures?: Picture[];
  loading?: boolean;
}

/** Immagine semplificata per la griglia (NextImage) */
export interface SimplifiedImage {
  id: string;
  url: string;
  alt: string;
}

/** Props per il componente GalleryGrid */
export interface GalleryGridProps {
  images: SimplifiedImage[];
  onImageClick?: (index: number) => void;
}

/** Props per il componente GalleryLightboxClient */
export interface GalleryLightboxClientProps {
  pictures: Picture[];
  allImagesCount: number;
  startIndex?: number;
}

/** Props per il componente GalleryLightbox */
export interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  pictures: Picture[];
  startIndex: number;
}
