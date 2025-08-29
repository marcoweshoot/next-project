'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from 'react';
import dynamicImport from 'next/dynamic';

// Lazy load dei componenti pesanti
const Header = dynamicImport(() => import('@/components/Header'), {
  loading: () => <div className="h-16 bg-card animate-pulse" />,
  ssr: true,
});

const Footer = dynamicImport(() => import('@/components/Footer'), {
  loading: () => <div className="h-64 bg-card animate-pulse" />,
  ssr: true,
});

const PageBreadcrumbs = dynamicImport(() => import('@/components/PageBreadcrumbs'), {
  loading: () => <div className="h-6 bg-muted animate-pulse rounded" />,
  ssr: true,
});

const NotFound: React.FC = () => {
  const pathname = usePathname();

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: '404 - Pagina non trovata' }
  ];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-32 pt-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">404</h1>
          <h2 className="text-2xl md:text-3xl mb-6">Pagina non trovata</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Oops! La pagina che stai cercando non esiste o è stata spostata.
          </p>

          {/* Breadcrumbs */}
          <div className="flex justify-center">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>
        </div>
      </section>
      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Torna alla Home
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NotFound;
