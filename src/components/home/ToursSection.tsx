"use client"

'use client';

import React, { useState } from 'react';
import ToursSectionHeader from './tours/ToursSectionHeader';
import ToursGrid from './tours/ToursGrid';
import ToursSectionFooter from './tours/ToursSectionFooter';
import { transformGraphQLTours, filterTours } from './tours/TourDataTransformer';
import { useOptimizedTours } from '@/hooks/useOptimizedTours';
import { Tour } from '@/types';

interface HomePageTours {
  id: string;
  title: string;
  subtitle: string;
  tours: Array<{
    id: string;
    title: string;
    slug: string;
    description?: string;
    excerpt?: string;
    difficulty?: string;
    currency?: string;
    image?: {
      url: string;
      alternativeText?: string;
    };
    places?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    states?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    sessions?: Array<{
      id: string;
      start: string;
      end: string;
      price: number;
      maxPax: number;
      users?: Array<{
        id: string;
        username: string;
        firstName?: string;
        lastName?: string;
        profilePicture?: {
          url: string;
        };
      }>;
    }>;
  }>;
}

interface ToursSectionProps {
  homePageTours?: HomePageTours;
  loading?: boolean;
}

const ToursSection: React.FC<ToursSectionProps> = ({ homePageTours, loading: externalLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use optimized hook if no external data provided
  const { tours: optimizedTours, loading: optimizedLoading } = useOptimizedTours(6, true);
  
  const isLoading = externalLoading || optimizedLoading;
  
  // Transform GraphQL tours to Tour format
  const transformedTours: Tour[] = homePageTours?.tours ? 
    transformGraphQLTours(homePageTours.tours) : 
    optimizedTours;

  // Filter tours based on search term
  const filteredTours: Tour[] = filterTours(transformedTours, searchTerm);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToursSectionHeader 
          title={homePageTours?.title}
          subtitle={homePageTours?.subtitle}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <ToursGrid 
          tours={filteredTours.slice(0, 6)}
          loading={isLoading}
          searchTerm={searchTerm}
        />

        <ToursSectionFooter />
      </div>
    </section>
  );
};

export default ToursSection;
