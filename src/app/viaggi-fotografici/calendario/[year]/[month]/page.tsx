// app/viaggi-fotografici/calendario/[year]/[month]/page.tsx
import CalendarMonthContent from '@/components/calendar-month/CalendarMonthContent';
import { getFutureSessionsGroupedByMonth } from '@/utils/getFutureSessionsGroupedByMonth';
import type { Metadata } from 'next';

type Params = { year: string; month: string };
type PageProps = { params: Params };

export const dynamic = 'error';
export const dynamicParams = false;
export const fetchCache = 'force-cache';
export const revalidate = false;

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const { groupedSessions } = await getFutureSessionsGroupedByMonth();
    const paths = Object.values(groupedSessions).map(g => ({
      year: String(g.year),
      month: g.month.toLowerCase(),
    }));
    return paths.sort((a, b) =>
      a.year === b.year ? a.month.localeCompare(b.month, 'it-IT') : a.year.localeCompare(b.year)
    );
  } catch { return []; }
}

// ✅ niente Promise nei params, niente await
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month } = params;
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  const title = `Viaggi Fotografici ${capitalizedMonth} ${year} | WeShoot`;
  const description = `Scopri tutti i viaggi fotografici in programma per ${capitalizedMonth} ${year}. Date, destinazioni e posti disponibili.`;
  const ogImage = '/lovable-uploads/hero-calendar.avif';

  return {
    title,
    description,
    alternates: { canonical: `/viaggi-fotografici/calendario/${year}/${month}` },
    openGraph: {
      title, description,
      url: `/viaggi-fotografici/calendario/${year}/${month}`,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function Page({ params }: PageProps) {
  const { year, month } = params;
  return <CalendarMonthContent year={year} month={month} />;
}
