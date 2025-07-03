"use client"

import { useParams } from "next/navigation";
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_COLLECTION_DETAIL } from '@/graphql/queries';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import CollectionDetailHero from '@/components/collection-detail/CollectionDetailHero';
import CollectionDetailContent from '@/components/collection-detail/CollectionDetailContent';
import CollectionDetailTours from '@/components/collection-detail/CollectionDetailTours';
import CollectionDetailFAQ from '@/components/collection-detail/CollectionDetailFAQ';
import CollectionDetailLoading from '@/components/collection-detail/CollectionDetailLoading';
import CollectionDetailError from '@/components/collection-detail/CollectionDetailError';

const CollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data, loading, error } = useQuery(GET_COLLECTION_DETAIL, {
    variables: { slug, locale: 'it' },
    skip: !slug
  });

  if (loading) return <CollectionDetailLoading />;
  if (error || !data?.collections?.[0]) return <CollectionDetailError error={error} />;

  const collection = data.collections[0];

  return (
    <>
      <SEO 
        title={collection.seo?.metaTitle || `${collection.name} - Collezioni WeShoot`}
        description={collection.seo?.metaDescription || collection.excerpt}
        url={`https://www.weshoot.it/viaggi-fotografici/collezioni/${collection.slug}`}
        image={collection.image?.url}
      />
      
      <Header />
      
      <div>
        <CollectionDetailHero collection={collection} />
        
        <CollectionDetailContent collection={collection} />
        
        <CollectionDetailTours tours={collection.tours || []} />
        
        {collection.faqs && collection.faqs.length > 0 && (
          <CollectionDetailFAQ 
            faqs={collection.faqs} 
            collectionName={collection.name} 
          />
        )}
      </div>
    </>
  );
};

export default CollectionDetail;
