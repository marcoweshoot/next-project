import Head from 'next/head';
import React from 'react';

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

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="it-IT" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="it_IT" />

      {/* Article-specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@weshootit" />

      {/* Altri tag */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#ff6b35" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default SEO;
