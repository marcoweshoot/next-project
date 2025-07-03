
import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import TourDayLocation from './TourDayLocation';

interface DayStep {
  id: string;
  title: string;
  description: string;
  locations?: DayLocation[];
}

interface DayLocation {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: Array<{
    id: string;
    title: string;
    url: string;
    alternativeText: string;
  }>;
}

interface TourDayStepsProps {
  steps: DayStep[];
  onOpenLightbox: (pictures: Array<{id: string; title: string; url: string; alternativeText: string;}>, startIndex?: number) => void;
}

const TourDaySteps: React.FC<TourDayStepsProps> = ({ steps, onOpenLightbox }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 mb-6">
        <Camera className="w-6 h-6 text-primary" />
        <h4 className="text-xl font-bold text-gray-900">Programma fotografico del giorno</h4>
      </div>
      
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Timeline connector */}
          {index < steps.length - 1 && (
            <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-primary/30 to-transparent"></div>
          )}
          
          <div className="flex space-x-6">
            {/* Timeline dot with map route icon - no background */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
              <img 
                src="/lovable-uploads/4fe0578a-9abf-4dd3-82ec-b26dd8ca197d.png" 
                alt="Route icon" 
                className="w-8 h-8"
              />
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
              <h5 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors duration-200">
                {step.title}
              </h5>
              <div 
                className="text-gray-700 leading-relaxed prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: step.description }}
              />

              {step.locations && step.locations.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h6 className="font-bold text-gray-900">Location fotografiche</h6>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {step.locations.map((location) => (
                      <TourDayLocation
                        key={location.id}
                        location={location}
                        onOpenLightbox={onOpenLightbox}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TourDaySteps;
