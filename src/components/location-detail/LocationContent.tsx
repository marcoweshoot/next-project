
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
  console.log("🔍 LocationContent - Received location:", location);
  console.log("🔍 LocationContent - Loading:", loading);

  if (loading || !location) {
    console.log("🔍 LocationContent - Skipping render (loading or no location)");
    return null;
  }

  // Ensure pictures is always an array
  const safePictures = Array.isArray(location.pictures) ? location.pictures : [];
  console.log("🔍 LocationContent - Safe pictures:", safePictures.length);

  return (
    <>
      {/* Description */}
      {location.description && (
        <div className="text-center mb-12">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {location.description}
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

export default LocationContent;
