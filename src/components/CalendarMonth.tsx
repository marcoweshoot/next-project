import CalendarMonthContent from './calendar-month/CalendarMonthContent';

interface CalendarMonthProps {
  year: string;
  month: string;
}

const CalendarMonth = ({ year, month }: CalendarMonthProps) => {
  return <CalendarMonthContent year={year} month={month} />;
};

export default CalendarMonth;
