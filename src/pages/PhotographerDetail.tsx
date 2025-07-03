"use client"

import { useParams } from "next/navigation";
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PHOTOGRAPHER_BY_USERNAME, GET_PHOTOGRAPHER_TOURS } from '@/graphql/queries';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotographerHero from '@/components/photographer-detail/PhotographerHero';
import PhotographerGallery from '@/components/photographer-detail/PhotographerGallery';
import PhotographerTours from '@/components/photographer-detail/PhotographerTours';

const PhotographerDetail = () => {
  const { username } = useParams<{ username: string }>();

  const { data: photographerData, loading: photographerLoading, error: photographerError } = useQuery(
    GET_PHOTOGRAPHER_BY_USERNAME,
    {
      variables: { username },
      skip: !username
    }
  );

  const { data: toursData, loading: toursLoading, error: toursError } = useQuery(
    GET_PHOTOGRAPHER_TOURS,
    {
      variables: { username },
      skip: !username
    }
  );

  if (photographerError || toursError) {
    console.error('Error loading photographer:', photographerError || toursError);
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto text-center py-12 px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Fotografo non trovato
          </h1>
          <p className="text-gray-600">
            Il fotografo che stai cercando non esiste o non è disponibile.
          </p>
        </div>
      </div>
    );
  }

  const photographer = photographerData?.users?.[0];
  const tours = toursData?.tours || [];

  if (!photographer && photographerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto text-center py-12 px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Caricamento...
          </h1>
        </div>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto text-center py-12 px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Fotografo non trovato
          </h1>
          <p className="text-gray-600">
            Il fotografo che stai cercando non esiste o non è disponibile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${photographer.firstName} ${photographer.lastName} - Fotografo WeShoot`}
        description={photographer.bio || `Scopri i viaggi fotografici con ${photographer.firstName} ${photographer.lastName}, fotografo professionista WeShoot.`}
        url={`https://www.weshoot.it/fotografi/${photographer.username}`}
        image={photographer.profilePicture?.url}
        type="profile"
      />
      <div className="min-h-screen bg-white">
        <Header />
        
        <PhotographerHero 
          photographer={photographer}
          loading={photographerLoading}
        />

        {photographer.pictures && photographer.pictures.length > 0 && (
          <PhotographerGallery 
            pictures={photographer.pictures}
            photographerName={`${photographer.firstName} ${photographer.lastName}`}
          />
        )}

        <PhotographerTours 
          tours={tours}
          photographerName={`${photographer.firstName} ${photographer.lastName}`}
          photographerUsername={photographer.username}
          loading={toursLoading}
        />
        
        <Footer />
      </div>
    </>
  );
};

export default PhotographerDetail;
