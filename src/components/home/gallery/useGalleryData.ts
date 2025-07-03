
import { ProcessedImage, Picture } from './types';

export const useGalleryData = (pictures?: Array<{ node: Picture }>) => {
  // Fallback images se non ci sono dati da Strapi
  const fallbackImages: ProcessedImage[] = [
    {
      id: '1',
      title: 'Aurora Boreale - Islanda',
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Aurora boreale in Islanda'
    },
    {
      id: '2',
      title: 'Safari - Kenya',
      url: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Elefante in Kenya'
    },
    {
      id: '3',
      title: 'Montagne - Patagonia',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Montagne della Patagonia'
    },
    {
      id: '4',
      title: 'Hanami - Giappone',
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Ciliegi in fiore in Giappone'
    },
    {
      id: '5',
      title: 'Fiordi - Norvegia',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Fiordi della Norvegia'
    },
    {
      id: '6',
      title: 'Dolomiti - Italia',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Dolomiti in autunno'
    },
    {
      id: '7',
      title: 'Desert - Marocco',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Deserto del Sahara'
    },
    {
      id: '8',
      title: 'Geyser - Islanda',
      url: 'https://images.unsplash.com/photo-1539066309449-cbaf10d68b9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Geyser in Islanda'
    },
    {
      id: '9',
      title: 'Tibet - Monastero',
      url: 'https://images.unsplash.com/photo-1583219574071-67d70da0b6b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Monastero in Tibet'
    },
    {
      id: '10',
      title: 'Antarctica - Pinguini',
      url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Pinguini in Antartide'
    },
    {
      id: '11',
      title: 'Vulcano - Kamchatka',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Vulcano attivo in Kamchatka'
    },
    {
      id: '12',
      title: 'Maldive - Underwater',
      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      alt: 'Vita marina alle Maldive'
    }
  ];

  // Trasforma i dati da Strapi nel formato necessario
  const allImages = pictures && pictures.length > 0 
    ? pictures.map((picture) => {
        console.log("Processing picture:", picture.node);
        const imageArray = picture.node.image;
        const firstImage = imageArray && Array.isArray(imageArray) && imageArray.length > 0 ? imageArray[0] : null;
        console.log("First image:", firstImage);
        
        return {
          id: picture.node.id,
          title: picture.node.title,
          url: firstImage ? firstImage.url : '',
          alt: firstImage?.alternativeText || picture.node.title
        };
      }).filter(img => img.url) // Filtra le immagini senza URL
    : fallbackImages;

  // Prendi solo le prime 12 per la griglia
  const galleryImages = allImages.slice(0, 12);

  console.log("Gallery images to display:", galleryImages);
  console.log("All images for lightbox:", allImages);

  return { allImages, galleryImages };
};
