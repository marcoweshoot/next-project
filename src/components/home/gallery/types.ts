
export interface Picture {
  id: string;
  title: string;
  type?: string;
  published_at: string;
  image: Array<{
    id: string;
    url: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
}

export interface GallerySectionProps {
  pictures?: Array<{ node: Picture }>;
  loading?: boolean;
}

export interface ProcessedImage {
  id: string;
  title: string;
  url: string;
  alt: string;
}
