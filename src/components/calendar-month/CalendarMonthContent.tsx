import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CalendarMonthHero from '@/components/calendar-month/CalendarMonthHero'; // 👈 nuovo
import CalendarMonthEmpty from './CalendarMonthEmpty';
import CalendarMonthToursGrid from './CalendarMonthToursGrid';
import { fetchCalendarData } from '@/lib/api/calendar';

interface Props { year: string; month: string; }

const CalendarMonthContent = async ({ year, month }: Props) => {
  const { groupedSessions } = await fetchCalendarData();

  const normalizedMonth = month.toLowerCase();
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const key = `${year}-${normalizedMonth}`;
  const monthData = groupedSessions[key];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <CalendarMonthHero monthName={capitalizedMonth} year={year} />

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
