import Image from "next/image";
import React from "react";

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

const abs = (u?: string) =>
  u ? (u.startsWith("http") || u.startsWith("https") ? u : `https://api.weshoot.it${u}`) : "";

const FALLBACK =
  "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif";

export default function PhotographerGallery({
  pictures,
  photographerName,
}: PhotographerGalleryProps) {
  // Mostra al massimo 12 per alleggerire il primo paint
  const displayPictures = (pictures || []).slice(0, 12);

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
            const mainImage = picture.image?.[0];
            const src = abs(mainImage?.url) || FALLBACK;
            const alt =
              mainImage?.alternativeText ||
              picture.title ||
              `Fotografia di ${photographerName}`;

            // layout responsivo + lazy per tutte
            const baseClasses =
              "relative overflow-hidden rounded-lg shadow-lg group cursor-pointer";
            const layoutClasses = [
              index === 0 ? "md:col-span-2 md:row-span-2" : "",
              index === 4 ? "lg:col-span-2" : "",
              index === 7 ? "md:row-span-2" : "",
            ]
              .filter(Boolean)
              .join(" ");

            // altezze simili alle tue, con Image fill
            const heightClasses =
              index === 0
                ? "h-[400px] md:h-[420px] lg:h-[560px]"
                : "h-[200px] md:h-[220px] lg:h-[260px]";

            return (
              <div key={picture.id} className={`${baseClasses} ${layoutClasses} ${heightClasses}`}>
                <Image
                  src={src}
                  alt={alt}
                  fill
                  // Lazy di default (esplicito + priorità bassa per sicurezza)
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      {picture.title && (
                        <h3 className="font-bold text-lg mb-2">{picture.title}</h3>
                      )}
                      {mainImage?.caption && <p className="text-sm">{mainImage.caption}</p>}
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
}
