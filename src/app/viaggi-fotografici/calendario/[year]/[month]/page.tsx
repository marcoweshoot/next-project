import CalendarMonthContent from '@/components/calendar-month/CalendarMonthContent';
import { getFutureSessionsGroupedByMonth } from '@/utils/getFutureSessionsGroupedByMonth';
import type { Metadata } from 'next';

type Params = { year: string; month: string };
type PageProps = { params: Promise<Params> };

export const dynamic = 'error';
export const dynamicParams = false;
export const fetchCache = 'force-cache';
export const revalidate = false;

// Genera le rotte statiche in base ai dati reali
export async function generateStaticParams(): Promise<Params[]> {
  try {
    const { groupedSessions } = await getFutureSessionsGroupedByMonth();

    const paths = Object.values(groupedSessions).map((group) => ({
      year: String(group.year),
      month: group.month.toLowerCase(), // es. "luglio", "agosto"
    }));

    // opzionale: ordine stabile
    return paths.sort((a, b) =>
      a.year === b.year ? a.month.localeCompare(b.month, 'it-IT') : a.year.localeCompare(b.year)
    );
  } catch {
    return [];
  }
}

// SEO dinamico per ogni pagina mese
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month } = await params;
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return {
    title: `Viaggi Fotografici ${capitalizedMonth} ${year} | WeShoot`,
    description: `Scopri tutti i viaggi fotografici programmati per questo mese. Prenota il tuo posto ora.`,
    alternates: {
      canonical: `https://www.weshoot.it/viaggi-fotografici/calendario/${year}/${month}`,
    },
  };
}

// Rendering della pagina
export default async function Page({ params }: PageProps) {
  const { year, month } = await params;
  return <CalendarMonthContent year={year} month={month} />;
}
