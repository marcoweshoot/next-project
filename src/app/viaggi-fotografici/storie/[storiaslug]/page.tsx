import { notFound } from 'next/navigation';
import { getClient } from '@/lib/apolloClient';
import { GET_STORY_DETAIL_BY_SLUG, GET_STORY_SLUGS } from '@/graphql/queries/story-detail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoryHero from '@/components/story-detail/StoryHero';
import StoryContent from '@/components/story-detail/StoryContent';
import StoryRelatedTours from '@/components/story-detail/StoryRelatedTours';

export const dynamic = 'force-static';
export const revalidate = 60;
export const dynamicParams = true;

type Params = { storiaslug: string };

export async function generateMetadata({ params }: { params: Params }) {
  const { storiaslug } = params;

  try {
    const { data } = await getClient().query({
      query: GET_STORY_DETAIL_BY_SLUG,
      variables: { slug: storiaslug, locale: 'it' },
      fetchPolicy: 'no-cache',
    });

    const story = data?.stories?.[0];
    if (!story) return {};

    const authorName = story?.photographer
      ? `${story.photographer.firstName || ''} ${story.photographer.lastName || ''}`.trim()
      : 'Autore';

    const title =
      story?.seo?.metaTitle || `${story.name} - Storia di ${authorName} | WeShoot`;
    const description =
      story?.seo?.metaDescription ||
      story?.description ||
      `Scopri la storia dietro questa fotografia di ${authorName}`;
    const url = `https://www.weshoot.it/viaggi-fotografici/storie/${story.slug}`;
    const images = story.photo?.url ? [{ url: story.photo.url }] : undefined;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url, images, type: 'article' },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images?.[0]?.url,
      },
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const { data } = await getClient().query({
      query: GET_STORY_SLUGS,
      variables: { locale: 'it' },
      fetchPolicy: 'no-cache',
    });

    return (data?.stories || [])
      .filter((s: any) => !!s?.slug)
      .map((s: any) => ({ storiaslug: s.slug }));
  } catch {
    return [];
  }
}

export default async function StoryPage({ params }: { params: Params }) {
  const { storiaslug } = params;

  let data: any;
  try {
    ({ data } = await getClient().query({
      query: GET_STORY_DETAIL_BY_SLUG,
      variables: { slug: storiaslug, locale: 'it' },
      fetchPolicy: 'no-cache',
    }));
  } catch {
    return notFound();
  }

  const story =
    data?.stories?.find((s: any) => s.slug === storiaslug) ??
    data?.stories?.[0];

  if (!story) return notFound();

  const authorName = story.photographer
    ? `${story.photographer.firstName || ''} ${story.photographer.lastName || ''}`.trim()
    : 'Autore';

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Storie di viaggio', path: '/viaggi-fotografici/storie/' },
    { name: story.name },
  ];

  const rawStructured = story?.seo?.structuredData;
  const structuredJson =
    typeof rawStructured === 'string'
      ? rawStructured
      : rawStructured
      ? JSON.stringify(rawStructured)
      : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <StoryHero
        story={story}
        authorName={authorName}
        breadcrumbElements={breadcrumbElements}
      />
      {structuredJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredJson }}
        />
      )}
      <StoryContent story={story} />
      {story.tour && (
        <StoryRelatedTours
          tours={Array.isArray(story.tour) ? story.tour : [story.tour]}
        />
      )}
      <Footer />
    </div>
  );
}
