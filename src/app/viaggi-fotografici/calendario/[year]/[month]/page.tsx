// app/viaggi-fotografici/calendario/[year]/[month]/page.tsx
import CalendarMonthContent from '@/components/calendar-month/CalendarMonthContent';
import { getFutureSessionsGroupedByMonth } from '@/utils/getFutureSessionsGroupedByMonth';
import type { Metadata } from 'next';

export const dynamic = 'error';
export const dynamicParams = false;
export const fetchCache = 'force-cache';
export const revalidate = false;

type RouteParams = { year: string; month: string };
async function unwrapParams(p: RouteParams | Promise<RouteParams>): Promise<RouteParams> {
  return (p && typeof (p as any).then === 'function') ? await (p as Promise<RouteParams>) : (p as RouteParams);
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  try {
    const { groupedSessions } = await getFutureSessionsGroupedByMonth();
    const paths = Object.values(groupedSessions).map(g => ({
      year: String(g.year),
      month: g.month.toLowerCase(),
    }));
    return paths.sort((a, b) =>
      a.year === b.year ? a.month.localeCompare(b.month, 'it-IT') : a.year.localeCompare(b.year)
    );
  } catch {
    return [];
  }
}

// 👇 non tipizzare col tuo PageProps: lascia che Next usi il suo.
//    Gestiamo sia params Promise sia oggetto.
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { year, month } = await unwrapParams(params);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  const title = `Viaggi Fotografici ${capitalizedMonth} ${year} | WeShoot`;
  const description = `Scopri tutti i viaggi fotografici in programma per ${capitalizedMonth} ${year}. Date, destinazioni e posti disponibili.`;
  const ogImage = 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/hero-calendar.jpg';

  return {
    title,
    description,
    alternates: { canonical: `/viaggi-fotografici/calendario/${year}/${month}` },
    openGraph: {
      title,
      description,
      url: `/viaggi-fotografici/calendario/${year}/${month}`,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function Page({ params }: any) {
  const { year, month } = await unwrapParams(params);
  return <CalendarMonthContent year={year} month={month} />;
}
