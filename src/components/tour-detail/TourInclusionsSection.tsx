
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface InclusionItem {
  title: string;
  description?: string;
  icon?: {
    url: string;
    alternativeText?: string;
  };
}

interface TourInclusionsSectionProps {
  includes?: InclusionItem[];
  excludes?: InclusionItem[];
}

const TourInclusionsSection: React.FC<TourInclusionsSectionProps> = ({ 
  includes, 
  excludes 
}) => {
  return (
    <>
      {/* What's included */}
      {includes && includes.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Cosa include
          </h3>
          <div className="space-y-3">
            {includes.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                {item.icon?.url ? (
                  <img 
                    src={item.icon.url} 
                    alt={item.icon.alternativeText || item.title}
                    className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-70"
                  />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's not included */}
      {excludes && excludes.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            Cosa non include
          </h3>
          <div className="space-y-3">
            {excludes.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                {item.icon?.url ? (
                  <img 
                    src={item.icon.url} 
                    alt={item.icon.alternativeText || item.title}
                    className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-70"
                  />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TourInclusionsSection;
