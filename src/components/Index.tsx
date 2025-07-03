"use client"

import React from 'react';
import { useQuery } from '@apollo/client';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GET_COLLECTIONS } from '@/graphql/queries';
import { GET_GROUP_PICTURES } from '@/graphql/queries/pictures';
import { GET_HOMEPAGE } from '@/graphql/queries/homepage';
import HeroVideoSection from '@/components/home/HeroVideoSection';
import CollectionSection from '@/components/home/CollectionSection';
import ToursSection from '@/components/home/ToursSection';
import WhySection from '@/components/WhySection';
import GallerySection from '@/components/home/GallerySection';
import LastMinuteSection from '@/components/home/LastMinuteSection';
import WhatsWeShootSection from '@/components/home/WhatsWeShootSection';
import CoursesSection from '@/components/home/CoursesSection';
import AcademySection from '@/components/home/AcademySection';

console.log("Index.tsx: Loading Index page");

const Index = () => {
  console.log("Index.tsx: Rendering Index component");
  
  // Fetch homepage data
  const { data: homePageData, loading: homePageLoading, error: homePageError } = useQuery(GET_HOMEPAGE, {
    variables: { locale: 'it' }
  });

  // Fetch collections data
  const { data: collectionsData, loading: collectionsLoading, error: collectionsError } = useQuery(GET_COLLECTIONS, {
    variables: { locale: 'it' }
  });

  // Fetch group pictures data (filtered for type: "group")
  const { data: picturesData, loading: picturesLoading, error: picturesError } = useQuery(GET_GROUP_PICTURES, {
    variables: { limit: 50 }
  });

  console.log("Group pictures data received:", picturesData);
  console.log("Group pictures loading:", picturesLoading);
  console.log("Group pictures error:", picturesError);

  if (homePageError) {
    console.error("Error loading homepage:", homePageError);
  }

  if (collectionsError) {
    console.error("Error loading collections:", collectionsError);
  }

  if (picturesError) {
    console.error("Error loading group pictures:", picturesError);
  }

  // Safe data processing for pictures
  let processedPictures = undefined;
  if (picturesData?.pictures && Array.isArray(picturesData.pictures)) {
    console.log("Processing pictures array with length:", picturesData.pictures.length);
    processedPictures = picturesData.pictures.map((picture: any) => {
      console.log("Processing picture:", picture);
      return { node: picture };
    });
    console.log("Processed pictures:", processedPictures);
  } else {
    console.log("Pictures data is not an array or is undefined:", picturesData);
  }
  
  try {
    return (
      <>
        <SEO 
          title="WeShoot.it - Viaggi Fotografici nel Mondo"
          description="Esplora i nostri viaggi fotografici unici e corsi online per appassionati. Scopri destinazioni mozzafiato con coach professionali."
        />
        
        <div>
          <Header />
          
          <main>
            {/* Hero Section with Video Background */}
            <HeroVideoSection />
            
            {/* Collections Section */}
            <CollectionSection 
              collections={Array.isArray(collectionsData?.collections) ? collectionsData.collections : []}
              loading={collectionsLoading}
            />
            
            {/* Tours Section - now using homepage Tours data */}
            <ToursSection 
              homePageTours={homePageData?.homePage?.Tours}
              loading={homePageLoading}
            />
            
            {/* Why WeShoot Section with Gallery */}
            <WhySection />
            <GallerySection 
              pictures={processedPictures}
              loading={picturesLoading}
            />
            
            {/* Last Minute Section */}
            <LastMinuteSection />
            
            {/* What's WeShoot Section */}
            <WhatsWeShootSection />
            
            {/* Courses Section */}
            <CoursesSection />
            
            {/* Academy Section */}
            <AcademySection />
          </main>
          
          <Footer />
        </div>
      </>
    );
  } catch (error) {
    console.error("Index.tsx: Error rendering Index component:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Errore di Rendering</h1>
          <p className="text-gray-600">Si è verificato un errore nel caricamento della pagina.</p>
          <pre className="mt-4 text-sm bg-gray-100 p-4 rounded">{error?.toString()}</pre>
        </div>
      </div>
    );
  }
};

export default Index;
