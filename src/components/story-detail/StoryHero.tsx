
import React from 'react';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

interface StoryHeroProps {
  story: {
    name: string;
    photo?: {
      url: string;
      alternativeText?: string;
    };
  };
  authorName: string;
  breadcrumbElements: Array<{ name: string; path?: string }>;
}

const StoryHero: React.FC<StoryHeroProps> = ({ story, authorName, breadcrumbElements }) => {
  return (
    <section className="relative">
      <div className="relative h-[70vh] overflow-hidden">
        <img
          src={story.photo?.url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'}
          alt={story.photo?.alternativeText || story.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Title and Breadcrumbs */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <PageBreadcrumbs elements={breadcrumbElements} className="mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {story.name}
            </h1>
            <p className="text-xl text-white/90">
              di {authorName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryHero;
