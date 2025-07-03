"use client"


import Link from "next/link";
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STORIES } from '@/graphql/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';

const Stories = () => {
  const [displayedStories, setDisplayedStories] = useState(5);
  const [loading, setLoading] = useState(false);

  const { data, loading: queryLoading, error } = useQuery(GET_STORIES, {
    variables: { locale: 'it' }
  });

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Storie di viaggio' }
  ];

  const loadMoreStories = useCallback(() => {
    if (data?.stories && displayedStories < data.stories.length) {
      setLoading(true);
      setTimeout(() => {
        setDisplayedStories(prev => Math.min(prev + 5, data.stories.length));
        setLoading(false);
      }, 500);
    }
  }, [data?.stories, displayedStories]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
      loadMoreStories();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreStories]);

  if (error) {
    console.error('Error loading stories:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Errore nel caricamento delle storie
            </h1>
            <p className="text-gray-600">
              Si è verificato un errore durante il caricamento. Riprova più tardi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder stories for demonstration
  const placeholderStories = [
    {
      id: '1',
      name: 'EMOTIONS',
      slug: 'emotions',
      photo: { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Aurora Boreale' }
    },
    {
      id: '2',
      name: 'ALONE TOGETHER IN THE STARDUST',
      slug: 'alone-together-stardust',
      photo: { url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Stardust' }
    },
    {
      id: '3',
      name: 'DINOSAUR EGGS',
      slug: 'dinosaur-eggs',
      photo: { url: 'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Dinosaur Eggs' }
    },
    {
      id: '4',
      name: 'FROZEN WORLD',
      slug: 'frozen-world',
      photo: { url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Frozen World' }
    },
    {
      id: '5',
      name: 'FELL FOR THESE OCEAN EYES',
      slug: 'ocean-eyes',
      photo: { url: 'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Ocean Eyes' }
    },
    {
      id: '6',
      name: 'FAIRYLAND',
      slug: 'fairyland',
      photo: { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Fairyland' }
    },
    {
      id: '7',
      name: 'ANOTHER STORY',
      slug: 'another-story',
      photo: { url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', alternativeText: 'Another Story' }
    }
  ];

  const stories = data?.stories || placeholderStories;
  const visibleStories = stories.slice(0, displayedStories);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Storie di viaggio"
        description="Le storie di viaggio raccontante attraverso le nostre foto"
        url="https://www.weshoot.it/viaggi-fotografici/storie/"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20">
        <div className="absolute inset-0 bg-black/40" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Storie di viaggio
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Le storie di viaggio raccontante attraverso le nostre foto
            </p>
            
            {/* Breadcrumbs */}
            <div className="flex justify-center">
              <PageBreadcrumbs elements={breadcrumbElements} />
            </div>
          </div>
        </div>
      </section>
      {/* Stories List */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {queryLoading ? (
            <div className="space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                  <Skeleton className="h-80 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {visibleStories.map((story: any) => (
                <Link
                  key={story.id}
                  href={`/viaggi-fotografici/storie/${story.slug}`}
                  className="block group"
                >
                  <div className="relative overflow-hidden rounded-lg h-80 bg-gray-900">
                    <img
                      src={story.photo?.url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                      alt={story.photo?.alternativeText || story.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Story Title */}
                    <div className="absolute bottom-6 left-6">
                      <h2 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
                        {story.name}
                      </h2>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Loading indicator for infinite scroll */}
              {loading && (
                <div className="space-y-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={`loading-${i}`} className="relative overflow-hidden rounded-lg">
                      <Skeleton className="h-80 w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {!queryLoading && (!stories || stories.length === 0) && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nessuna storia disponibile
              </h2>
              <p className="text-gray-600 mb-8">
                Le nostre storie di viaggio saranno presto disponibili.
              </p>
              <Link 
                href="/viaggi-fotografici/"
                className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Scopri tutti i viaggi
              </Link>
            </div>
          )}
          
          {/* End of stories indicator */}
          {data?.stories && displayedStories >= data.stories.length && data.stories.length > 5 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Hai visto tutte le storie disponibili</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Stories;
