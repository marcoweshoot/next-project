
import React from 'react';

interface Picture {
  id: string;
  title?: string;
  type?: string;
  image: {
    id: string;
    url: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
  }[];
}

interface PhotographerGalleryProps {
  pictures: Picture[];
  photographerName: string;
}

const PhotographerGallery: React.FC<PhotographerGalleryProps> = ({ pictures, photographerName }) => {
  // Prendiamo solo le prime 15 immagini per la galleria
  const displayPictures = pictures.slice(0, 15);

  // Helper function per gestire gli URL delle immagini
  const getImageUrl = (url: string) => {
    console.log('Original URL:', url);
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('URL already complete:', url);
      return url;
    }
    const finalUrl = `https://api.weshoot.it${url}`;
    console.log('Final URL:', finalUrl);
    return finalUrl;
  };

  console.log('Pictures in gallery:', pictures);
  console.log('Display pictures:', displayPictures);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Alcune delle mie ultime fotografie scattate nei miei viaggi
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPictures.map((picture, index) => {
            // Prendiamo la prima immagine dell'array
            const mainImage = picture.image[0];
            
            return (
              <div 
                key={picture.id}
                className={`
                  relative overflow-hidden rounded-lg shadow-lg group cursor-pointer
                  ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                  ${index === 4 ? 'lg:col-span-2' : ''}
                  ${index === 7 ? 'md:row-span-2' : ''}
                `}
              >
                <img
                  src={getImageUrl(mainImage.url)}
                  alt={mainImage.alternativeText || picture.title || `Fotografia di ${photographerName}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    minHeight: index === 0 ? '400px' : '200px',
                    height: index === 0 ? '400px' : '200px'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', mainImage.url);
                    console.error('Error event:', e);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', mainImage.url);
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      {picture.title && (
                        <h3 className="font-bold text-lg mb-2">{picture.title}</h3>
                      )}
                      {mainImage.caption && (
                        <p className="text-sm">{mainImage.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PhotographerGallery;
