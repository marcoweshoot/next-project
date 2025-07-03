"use client"

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';
import { useEffect } from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

const NotFound = () => {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-32 pt-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">404</h1>
          <h2 className="text-2xl md:text-3xl mb-6">Pagina non trovata</h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
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
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
