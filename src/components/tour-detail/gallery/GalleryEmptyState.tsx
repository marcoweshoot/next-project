
import React from 'react';

const GalleryEmptyState: React.FC = () => {
  return (
    <section id="gallery" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Galleria Fotografica
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Le immagini della galleria saranno disponibili a breve.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GalleryEmptyState;
