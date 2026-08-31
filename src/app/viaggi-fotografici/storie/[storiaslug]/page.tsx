import { notFound } from 'next/navigation';
import { getClient } from '@/lib/apolloClient';
import { GET_STORY_DETAIL_BY_SLUG, GET_STORY_SLUGS } from '@/graphql/queries/story-detail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoryHero from '@/components/story-detail/StoryHero';
import StoryContent from '@/components/story-detail/StoryContent';
import StoryRelatedTours from '@/components/story-detail/StoryRelatedTours';

const SITE_URL = 'https://www.weshoot.it';

const absUrl = (u?: string) =>
  !u ? '' : u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`;

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export const revalidate = 60;
export const dynamicParams = true;

type Params = { storiaslug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { storiaslug } = await params;
  try {
    const { data } = await getClient().query({
      query: GET_STORY_DETAIL_BY_SLUG,
      variables: { slug: storiaslug, locale: 'it' },
      fetchPolicy: 'no-cache',
    });

    // NB: l'endpoint ignora `where`/`limit` e restituisce tutte le storie:
    // va selezionata per slug, come fa il componente pagina.
    const story =
      data?.stories?.find((s: any) => s.slug === storiaslug) ?? data?.stories?.[0];
    if (!story) return {};

    const authorName = story?.photographer
      ? `${story.photographer.firstName || ''} ${story.photographer.lastName || ''}`.trim()
      : 'Autore';

    // Strapi espone `seo` come componente ripetibile per le storie: arriva come array
    const seo = Array.isArray(story?.seo) ? story.seo[0] : story?.seo;

    const title = seo?.metaTitle || `${story.name} - Storia di ${authorName} | WeShoot`;
    const description =
      seo?.metaDescription ||
      story?.description ||
      `Scopri la storia dietro questa fotografia di ${authorName}`;
    const url = `https://www.weshoot.it/viaggi-fotografici/storie/${story.slug}`;
    const images = story.photo?.url ? [{ url: story.photo.url }] : undefined;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url, images, type: 'article' },
      twitter: { card: 'summary_large_image', title, description, images: images?.[0]?.url },
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

export default async function StoryPage({ params }: { params: Promise<Params> }) {
  const { storiaslug } = await params;

  let data: any;
  try {
    ({ data } = await getClient().query({
      query: GET_STORY_DETAIL_BY_SLUG,
      variables: { slug: storiaslug, locale: 'it' },
      fetchPolicy: 'no-cache',
    }));
  } catch {
    notFound();
  }

  const story =
    data?.stories?.find((s: any) => s.slug === storiaslug) ?? data?.stories?.[0];
  if (!story) notFound();

  const authorName = story.photographer
    ? `${story.photographer.firstName || ''} ${story.photographer.lastName || ''}`.trim()
    : 'Autore';

  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Storie di viaggio', path: '/viaggi-fotografici/storie/' },
    { name: story.name },
  ];

  // Strapi espone `seo` come componente ripetibile per le storie: arriva come array
  const seo = Array.isArray(story?.seo) ? story.seo[0] : story?.seo;

  const pageUrl = `${SITE_URL}/viaggi-fotografici/storie/${story.slug}`;
  const articleJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: seo?.metaTitle || story.name,
    description: stripHtml(seo?.metaDescription || story.description || ''),
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    inLanguage: story.locale || 'it',
    publisher: {
      '@type': 'Organization',
      name: 'WeShoot',
      url: SITE_URL,
    },
  };

  if (authorName && authorName !== 'Autore') {
    articleJsonLd.author = { '@type': 'Person', name: authorName };
  }
  if (story.photo?.url) {
    articleJsonLd.image = absUrl(story.photo.url);
  }
  if (story.published_at) articleJsonLd.datePublished = story.published_at;
  if (story.updated_at) articleJsonLd.dateModified = story.updated_at;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StoryHero
        story={story}
        authorName={authorName}
        breadcrumbElements={breadcrumbElements}
      />
      <script
        id="ld-story-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
