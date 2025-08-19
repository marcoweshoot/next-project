import React from 'react';
import Image from 'next/image';
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
  const imageUrl = story.photo?.url || 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif';
  const imageAlt = story.photo?.alternativeText?.trim() || `Fotografia della storia: ${story.name}`;

  return (
    <section className="relative" aria-label={`Hero della storia ${story.name}`}>
      <title>{`${story.name} – Storia di ${authorName} | WeShoot`}</title>

      <div className="relative h-[70vh] min-h-[400px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

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
