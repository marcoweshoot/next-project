
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

export default GalleryLayout;
