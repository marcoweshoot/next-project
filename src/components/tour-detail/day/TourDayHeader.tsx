
import React from 'react';
import { Clock } from 'lucide-react';

interface TourDayHeaderProps {
  number: number;
  title: string;
}

const TourDayHeader: React.FC<TourDayHeaderProps> = ({ number, title }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-600 p-8 text-white">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {number}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-white/80" />
            <span className="text-white/80 font-medium">Giorno {number}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold leading-tight">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default TourDayHeader;
