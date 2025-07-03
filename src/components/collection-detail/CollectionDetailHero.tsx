
import Link from "next/link";
import React from 'react';
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

const CollectionDetailHero: React.FC<{
  children?: React.ReactNode;
}> = ({
  collection,
  children
}) => {
  return (
    <section className="relative bg-gray-900 pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={collection.image?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
          alt={collection.image?.alternativeText || collection.name}
          className="w-full h-full object-cover"
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
                    <Link href="/" className="hover:text-white">WeShoot</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/viaggi-fotografici/" className="hover:text-white">Viaggi Fotografici</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/viaggi-fotografici/collezioni/" className="hover:text-white">Collezioni</Link>
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
