import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CalendarContent from '@/components/calendar/CalendarContent';
import { getFutureSessionsGroupedByMonth } from '@/utils/getFutureSessionsGroupedByMonth';

export const dynamic = 'force-static';
export const fetchCache = 'force-cache';
export const revalidate = false;

// ✅ Dati SEO da Strapi con fallback sicuri
export async function generateMetadata() {
  const fallback = {
    title: 'Calendario Viaggi Fotografici | WeShoot',
    description: 'Scopri tutte le date disponibili per i nostri viaggi fotografici.',
    canonical: '/viaggi-fotografici/calendario',
    og: 'https://s3.eu-west-1.amazonaws.com/mars.weshoot.it/viaggi_fotografici_corsi_online_0ed282f75a.jpg',
  };

  try {
    const { seoData } = await getFutureSessionsGroupedByMonth();
    const title = seoData?.metaTitle || fallback.title;
    const description = (seoData?.metaDescription || fallback.description).trim();
    const canonical = seoData?.canonical || fallback.canonical;
    const og = seoData?.metaImage?.url || fallback.og;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: 'website',
        title,
        description,
        url: canonical,
        images: [{ url: og, width: 1200, height: 630, alt: 'WeShoot Calendario viaggi fotografici' }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [og] },
    };
  } catch {
    return {
      title: fallback.title,
      description: fallback.description,
      alternates: { canonical: fallback.canonical },
      openGraph: {
        type: 'website',
        title: fallback.title,
        description: fallback.description,
        url: fallback.canonical,
        images: [{ url: fallback.og, width: 1200, height: 630, alt: 'WeShoot Calendario viaggi fotografici' }],
      },
      twitter: { card: 'summary_large_image', title: fallback.title, description: fallback.description, images: [fallback.og] },
    };
  }
}

const Page = async () => {
  const { groupedSessions, coverImage } = await getFutureSessionsGroupedByMonth();

  return (
    <>
      <Header />
      <CalendarContent groupedSessions={groupedSessions} coverImage={coverImage} />
      <Footer />
    </>
  );
};

export default Page;
