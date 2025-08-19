import React from 'react';
import SinglePhotoLayout from './SinglePhotoLayout';
import TwoPhotosLayout from './TwoPhotosLayout';
import ThreePhotosLayout from './ThreePhotosLayout';
import MultiPhotosLayout from './MultiPhotosLayout';

interface GalleryLayoutProps {
  pictures: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  openLightbox: (index: number) => void;
}

const GalleryLayout: React.FC<GalleryLayoutProps> = ({
  pictures,
  hoveredIndex,
  setHoveredIndex,
  openLightbox
}) => {
  const pictureCount = pictures.length;

  if (pictureCount === 1) {
    return (
      <SinglePhotoLayout
        picture={pictures[0]}
        openLightbox={() => openLightbox(0)}
      />
    );
  }

  if (pictureCount === 2) {
    return (
      <TwoPhotosLayout
        pictures={pictures}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        openLightbox={openLightbox}
      />
    );
  }

  if (pictureCount === 3) {
    return (
      <ThreePhotosLayout
        pictures={pictures}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        openLightbox={openLightbox}
      />
    );
  }

  return (
    <MultiPhotosLayout
      pictures={pictures}
      hoveredIndex={hoveredIndex}
      setHoveredIndex={setHoveredIndex}
      openLightbox={openLightbox}
    />
  );
};

function arePropsEqual(prev: GalleryLayoutProps, next: GalleryLayoutProps) {
  if (prev.hoveredIndex !== next.hoveredIndex) return false;

  // Se cambiano le callback, vogliamo rerender per evitare chiusure stale
  if (prev.openLightbox !== next.openLightbox) return false;
  if (prev.setHoveredIndex !== next.setHoveredIndex) return false;

  // Confronto "profondo" ma leggero delle immagini
  const a = prev.pictures;
  const b = next.pictures;
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    const p1 = a[i];
    const p2 = b[i];
    if (
      p1.id !== p2.id ||
      p1.title !== p2.title ||
      p1.url !== p2.url ||
      p1.alternativeText !== p2.alternativeText
    ) {
      return false;
    }
  }

  return true;
}

GalleryLayout.displayName = 'GalleryLayout';

export default React.memo(GalleryLayout, arePropsEqual);
