"use client";

import { useParams } from "next/navigation";
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_STORIES_SIMPLE = gql`
  query GetStoriesSimple {
    stories {
      id
      name
      slug
      description
      photo {
        id
        url
        alternativeText
        caption
        width
        height
      }
      photographer {
        id
        instagram
        bio
        firstName
        lastName
        profilePicture {
          id
          url
          alternativeText
          caption
          width
          height
        }
      }
      tour {
        id
        title
        slug
        description
        excerpt
        difficulty
        experience_level
        currency
        image {
          id
          url
          alternativeText
          caption
          width
          height
        }
        places {
          id
          name
          slug
        }
        states {
          id
          name
          slug
          description
        }
        sessions {
          id
          start
          end
          status
          sessionId
          maxPax
          price
          deposit
          balance
          minPax
          currency
          priceCompanion
          locale
          users {
            id
            username
            firstName
            lastName
            bio
            instagram
            profilePicture {
              id
              url
              alternativeText
              caption
              width
              height
            }
          }
        }
        SEO {
          id
          metaTitle
          metaDescription
        }
      }
    }
  }
`;

export const useStoryDetail = () => {
  const { slug } = useParams();
  const { data, loading, error } = useQuery(GET_STORIES_SIMPLE);

  console.log("StoryDetail: Slug:", slug);
  console.log("StoryDetail: Query data:", data);
  console.log("StoryDetail: Loading:", loading);
  console.log("StoryDetail: Error:", error);

  const stories = data?.stories || [];
  const story = stories.find((s: any) => s.slug === slug);

  const authorName = story?.photographer 
    ? `${story.photographer.firstName} ${story.photographer.lastName || ''}`.trim()
    : 'Autore sconosciuto';

  console.log("StoryDetail: Story tour data:", story?.tour);

  return {
    story,
    authorName,
    loading,
    error
  };
};
