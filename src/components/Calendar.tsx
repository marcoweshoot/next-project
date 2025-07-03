import { useCalendarData } from '@/hooks/useCalendarData';
import React from 'react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CalendarLoading from '@/components/calendar/CalendarLoading';
import CalendarError from '@/components/calendar/CalendarError';
import CalendarContent from '@/components/calendar/CalendarContent';

const Calendar = () => {
  const { 
    groupedSessions, 
    loading, 
    error, 
    seoData, 
    coverImage 
  } = useCalendarData();

  if (loading) {
    return <CalendarLoading coverImage={coverImage} />;
  }

  if (error) {
    return <CalendarError error={error} />;
  }

  return (
    <>
      <SEO 
        title={seoData?.metaTitle || "Calendario Viaggi Fotografici | WeShoot"}
        description={seoData?.metaDescription || "Scopri tutte le date disponibili per i nostri viaggi fotografici. Pianifica la tua prossima avventura fotografica."}
      />

      <Header />
      
      <div>
        <CalendarContent 
          groupedSessions={groupedSessions}
          coverImage={coverImage}
        />
      </div>
      
      <Footer />
    </>
  );
};

export default Calendar;
