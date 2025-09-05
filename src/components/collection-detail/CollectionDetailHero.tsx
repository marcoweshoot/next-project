import Link from "next/link";
import React from 'react';
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Collection {
  id: string;
  name: string;
  slug: string;
  excerpt?: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
}

interface CollectionDetailHeroProps {
  collection: Collection;
}

const CollectionDetailHero: React.FC<CollectionDetailHeroProps> = ({ collection }) => {
  const imageUrl =
    collection.image?.url ||
    "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif";

  const imageAlt = collection.image?.alternativeText || collection.name;

  return (
    <section className="relative bg-gray-900 pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fadeInDown">
            {collection.name}
          </h1>

          {/* Breadcrumbs */}
          <div className="flex justify-center">
            <Breadcrumb className="text-gray-300">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-white">
                      WeShoot
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/viaggi-fotografici/" className="hover:text-white">
                      Viaggi Fotografici
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/viaggi-fotografici/collezioni/" className="hover:text-white">
                      Collezioni
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{collection.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionDetailHero;
