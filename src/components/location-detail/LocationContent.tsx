import React from 'react';
import LocationGallery from './LocationGallery';

interface LocationContentProps {
  location: {
    title: string;
    description?: string;
    pictures: Array<{
      id: string;
      title: string;
      url: string;
      alternativeText: string;
    }>;
  } | null;
  loading: boolean;
}

const LocationContent: React.FC<LocationContentProps> = ({ location, loading }) => {
  if (loading || !location) {
    return null;
  }

  const description = location.description?.trim();
  const safePictures = Array.isArray(location.pictures) ? location.pictures : [];

  return (
    <>
      {/* Description */}
      {description && (
        <div className="text-center mb-12">
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </div>
      )}

      {/* Gallery */}
      {safePictures.length > 0 && (
        <div className="mb-16">
          <LocationGallery 
            pictures={safePictures} 
            locationTitle={location.title} 
          />
        </div>
      )}
    </>
  );
};

function arePropsEqual(prev: LocationContentProps, next: LocationContentProps) {
  if (prev.loading !== next.loading) return false;

  const a = prev.location;
  const b = next.location;

  if (a === b) return true;
  if (!a || !b) return false;

  if (a.title !== b.title) return false;

  const aDesc = a.description?.trim() ?? '';
  const bDesc = b.description?.trim() ?? '';
  if (aDesc !== bDesc) return false;

  const ap = Array.isArray(a.pictures) ? a.pictures : [];
  const bp = Array.isArray(b.pictures) ? b.pictures : [];
  if (ap.length !== bp.length) return false;

  for (let i = 0; i < ap.length; i++) {
    const p1 = ap[i];
    const p2 = bp[i];
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

LocationContent.displayName = 'LocationContent';

export default React.memo(LocationContent, arePropsEqual);
