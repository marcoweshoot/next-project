"use client"

'use client';

import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "WeShoot.it - Viaggi Fotografici nel Mondo",
  description = "Esplora i nostri viaggi fotografici unici e corsi online per appassionati. Scopri destinazioni mozzafiato con coach professionali.",
  keywords = "viaggi fotografici, fotografia, workshop, corsi fotografia, destinazioni, coach fotografici, travel photography",
  image = "https://www.weshoot.it/images/og-image.jpg",
  url = "https://www.weshoot.it",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "WeShoot.it Team"
}) => {
  const siteTitle = "WeShoot.it";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Create or update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Viewport meta tag for mobile optimization
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'it-IT');

    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:site_name', siteTitle, true);
    updateMetaTag('og:locale', 'it_IT', true);

    // Article specific
    if (type === "article" && publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    if (type === "article" && modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }
    if (type === "article" && author) {
      updateMetaTag('article:author', author, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@weshootit');

    // Additional SEO tags
    updateMetaTag('format-detection', 'telephone=no');
    updateMetaTag('theme-color', '#ff6b35');
    updateMetaTag('mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [fullTitle, description, keywords, image, url, type, publishedTime, modifiedTime, author]);

  return null; // This component doesn't render anything visible
};

export default SEO;
