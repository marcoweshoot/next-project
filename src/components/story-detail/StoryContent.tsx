
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
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Story Description */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              La storia dietro a questo scatto
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              {story.description ? (
                <div dangerouslySetInnerHTML={{ __html: story.description }} />
              ) : (
                <p>Descrizione non disponibile per questa storia.</p>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              L'autore
            </h2>
            {story.photographer ? (
              <StoryAuthor photographer={story.photographer} />
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Informazioni autore non disponibili.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryContent;
