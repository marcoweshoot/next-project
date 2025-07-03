
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

const CalendarMonthLoading: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <PageHeader>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Caricamento...
            </h1>
            <p className="text-xl text-white/80">
              Stiamo caricando i viaggi del mese
            </p>
          </div>
        </PageHeader>
      </div>
      <Footer />
    </>
  );
};

export default CalendarMonthLoading;
