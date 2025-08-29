import React from 'react';
import StoryAuthor from './StoryAuthor';

interface StoryContentProps {
  story: {
    description?: string;
    photographer?: {
      id: string;
      instagram?: string;
      bio?: string;
      firstName: string;
      lastName?: string;
      profilePicture?: {
        id: string;
        url: string;
        alternativeText?: string;
        caption?: string;
        width?: number;
        height?: number;
      };
    };
  };
}

const StoryContent: React.FC<StoryContentProps> = ({ story }) => {
  return (
    <section className="py-16" aria-labelledby="story-description">
      <div className="max-w-6xl mx-auto px-4">
        <title>La storia dietro allo scatto – WeShoot</title>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Story Description */}
          <div>
            <h2 id="story-description" className="text-3xl font-bold text-foreground mb-6">
              La storia dietro a questo scatto
            </h2>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {story.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: story.description }}
                  aria-label="Contenuto della storia"
                />
              ) : (
                <p>Descrizione non disponibile per questa storia.</p>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div aria-labelledby="story-author">
            <h2 id="story-author" className="text-3xl font-bold text-foreground mb-6">
              L'autore
            </h2>
            {story.photographer ? (
              <StoryAuthor photographer={story.photographer} />
            ) : (
              <div className="p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground">Informazioni autore non disponibili.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryContent;
