"use client"

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_COACHES } from '@/graphql/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import CoachesHero from '@/components/CoachesHero';
import CoachesList from '@/components/CoachesList';

const Coaches = () => {
  const { data, loading, error } = useQuery(GET_COACHES);

  if (error) {
    console.error('Error loading coaches:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Errore nel caricamento dei coach
            </h1>
            <p className="text-gray-600">
              Si è verificato un errore durante il caricamento. Riprova più tardi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder coaches per dimostrare il layout
  const placeholderCoaches = [
    {
      id: '1',
      firstName: 'Marco',
      lastName: 'Carotenuto',
      username: 'marco-carotenuto',
      bio: 'Fotografo professionista specializzato in paesaggi e natura.',
      profilePicture: null,
      instagram: 'marcocarotenuto'
    },
    {
      id: '2',
      firstName: 'Alessandro',
      lastName: 'Cantarelli',
      username: 'alessandro-cantarelli',
      bio: 'Esperto di fotografia di viaggio e street photography.',
      profilePicture: null,
      instagram: 'alessandrocantarelli'
    },
    {
      id: '3',
      firstName: 'Lorenzo',
      lastName: 'Ranieri Tenti',
      username: 'lorenzo-ranieri-tenti',
      bio: 'Fotografo specializzato in ritratti e fotografia sociale.',
      profilePicture: null,
      instagram: 'lorenzoranieri'
    },
    {
      id: '4',
      firstName: 'Marika',
      lastName: 'Greco',
      username: 'marika-greco',
      bio: 'Fotografa creativa con focus su composizione e luce.',
      profilePicture: null,
      instagram: 'marikagreco'
    },
    {
      id: '5',
      firstName: 'Giacomo',
      lastName: 'Finotti',
      username: 'giacomo-finotti',
      bio: 'Esperto di fotografia notturna e astrofotografia.',
      profilePicture: null,
      instagram: 'giacomofinotti'
    },
    {
      id: '6',
      firstName: 'Anna',
      lastName: 'Pernice',
      username: 'anna-pernice',
      bio: 'Fotografa di matrimoni e eventi speciali.',
      profilePicture: null,
      instagram: 'annapernice'
    },
    {
      id: '7',
      firstName: 'Samuele',
      lastName: 'Bucci',
      username: 'samuele-bucci',
      bio: 'Fotografo di natura e wildlife.',
      profilePicture: null,
      instagram: 'samuelebucci'
    },
    {
      id: '8',
      firstName: 'Andrea',
      lastName: 'Curci',
      username: 'andrea-curci',
      bio: 'Specialista in fotografia urbana e architettura.',
      profilePicture: null,
      instagram: 'andreacurci'
    }
  ];

  // Trasforma i dati dalla struttura GraphQL più semplice
  const coaches = data?.users?.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio,
    instagram: user.instagram,
    profilePicture: user.profilePicture ? {
      localFile: {
        url: user.profilePicture.url,
        alternativeText: user.profilePicture.alternativeText
      }
    } : null
  })) || placeholderCoaches;

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Scopri i tuoi coach - WeShoot Fotografi"
        description="Passione, allegria, professionalità. Queste sono alcune delle peculiarità dei fotografi certificati WeShoot. Parti in sicurezza con i nostri coach."
        url="https://www.weshoot.it/fotografi/"
      />
      
      <Header />
      
      <CoachesHero />

      {/* Coaches Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Parti in viaggio con noi
            </h2>
          </div>

          <CoachesList coaches={coaches} loading={loading} />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Coaches;
