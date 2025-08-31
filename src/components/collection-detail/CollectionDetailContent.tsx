import React from 'react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  excerpt?: string;
  description?: string;
}

interface CollectionDetailContentProps {
  collection: Collection;
}

const CollectionDetailContent: React.FC<CollectionDetailContentProps> = ({ collection }) => {
  if (!collection.excerpt && !collection.description) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {collection.excerpt && (
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {collection.excerpt}
            </h2>
          </div>
        )}
        
        {collection.description && (
          <div className="prose prose-lg max-w-none text-muted-foreground dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: collection.description }} />
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionDetailContent;
