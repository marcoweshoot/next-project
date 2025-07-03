
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

interface ReviewsHeroProps {
  totalReviews: number;
}

const ReviewsHero: React.FC<{
  children?: React.ReactNode;
}> = ({
  totalReviews,
  children
}) => {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20">
      <div className="absolute inset-0 bg-black/40" />
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ecco cosa i WeShooters dicono di noi
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            {totalReviews}+ recensioni non possono sbagliare...
          </p>
          <p className="text-sm text-gray-300 uppercase tracking-wider">
            WESHOOT RECENSIONI
          </p>
          
          {/* Breadcrumbs */}
          <div className="flex justify-center mt-8">
            <Breadcrumb className="text-gray-300">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-white">WeShoot</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">Recensioni</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsHero;
