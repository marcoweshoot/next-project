"use client";
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import StoryHero from '@/components/story-detail/StoryHero';
import StoryContent from '@/components/story-detail/StoryContent';
import StoryRelatedTours from '@/components/story-detail/StoryRelatedTours';
import StoryLoading from '@/components/story-detail/StoryLoading';
import StoryError from '@/components/story-detail/StoryError';
import { useStoryDetail } from '@/hooks/useStoryDetail';
import { generateStoryBreadcrumbs } from '@/utils/storyBreadcrumbs';

const StoryDetail = () => {
  const { story, authorName, loading, error } = useStoryDetail();

  if (loading) {
    return <StoryLoading />;
  }

  if (error) {
    return <StoryError error={error} />;
  }

  if (!story) {
    return <StoryError notFound />;
  }

  const breadcrumbElements = generateStoryBreadcrumbs(story.name);

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={`${story.name} - Storia di ${authorName} | WeShoot`}
        description={story.description || `Scopri la storia dietro questa fotografia di ${authorName}`}
        url={`https://www.weshoot.it/viaggi-fotografici/storie-di-viaggio/${story.slug}`}
        image={story.photo?.url}
      />
      
      <Header />

      <StoryHero 
        story={story}
        authorName={authorName}
        breadcrumbElements={breadcrumbElements}
      />

      <StoryContent story={story} />

      {story.tour && (
        <StoryRelatedTours tours={Array.isArray(story.tour) ? story.tour : [story.tour]} />
      )}

      <Footer />
    </div>
  );
};

export default StoryDetail;
