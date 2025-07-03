
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

const CalendarMonthError: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <PageHeader>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Errore
            </h1>
            <p className="text-xl text-white/80">
              Si è verificato un errore nel caricamento dei viaggi
            </p>
          </div>
        </PageHeader>
      </div>
      <Footer />
    </>
  );
};

export default CalendarMonthError;
