
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface HighlightItem {
  id: string;
  title: string;
  description: string;
}

interface TourHighlightsProps {
  highlights: HighlightItem[];
}

const TourHighlights: React.FC<TourHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  console.log("TourHighlights: Rendering highlights without icons:", highlights);

  return (
    <div className="mt-8">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
        Punti Salienti del Viaggio
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((highlight) => (
          <Card key={highlight.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {/* Use default icon for all highlights */}
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-1 leading-tight">
                    {highlight.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TourHighlights;
