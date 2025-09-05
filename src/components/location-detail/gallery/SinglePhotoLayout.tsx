'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SinglePhotoLayoutProps {
  picture: {
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  };
  openLightbox: () => void;
}

const SinglePhotoLayout: React.FC<SinglePhotoLayoutProps> = ({ picture, openLightbox }) => {
  const fallbackImage =
    'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif';

  const [failed, setFailed] = useState(false);

  const src = failed ? fallbackImage : picture.url || fallbackImage;

  return (
    <div className="relative group cursor-pointer" onClick={openLightbox}>
      <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src={src}
          alt={picture.alternativeText || picture.title || 'Location image'}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => {
            console.error('🔍 LocationGallery - Image failed to load:', picture.url);
            setFailed(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
          <p className="text-white text-lg font-medium drop-shadow-lg">{picture.title}</p>
        </div>
      </div>
    </div>
  );
};

export default SinglePhotoLayout;
