import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import CalendarMonthEmpty from './CalendarMonthEmpty';
import CalendarMonthToursGrid from './CalendarMonthToursGrid';
import { fetchCalendarData } from '@/lib/api/calendar';
const hero = '/lovable-uploads/hero-calendar.avif';

interface Props { year: string; month: string; }

const CalendarMonthContent = async ({ year, month }: Props) => {
  const { groupedSessions /*, coverImage*/ } = await fetchCalendarData();

  const normalizedMonth = month.toLowerCase();
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const key = `${year}-${normalizedMonth}`;
  const monthData = groupedSessions[key];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* usa direttamente l'hero statica */}
      <PageHeader backgroundImage={hero}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Viaggi Fotografici {capitalizedMonth} {year}
          </h1>
          <p className="text-xl text-white/80">
            Tutti i viaggi programmati per {capitalizedMonth} {year}
          </p>
        </div>
      </PageHeader>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {monthData?.tours?.length > 0 ? (
            <CalendarMonthToursGrid
              tours={monthData.tours}
              monthName={capitalizedMonth}
              year={year}
            />
          ) : (
            <CalendarMonthEmpty monthName={capitalizedMonth} year={year} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CalendarMonthContent;
