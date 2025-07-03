
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle } from 'lucide-react';

interface ThingToKnow {
  id: string;
  title: string;
  description: string;
  locale?: string;
  published_at?: string;
  icon?: {
    id: string;
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
}

interface TourThingsToKnowProps {
  experienceLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  thingsToKnow?: ThingToKnow[];
}

const TourThingsToKnow: React.FC<TourThingsToKnowProps> = ({ 
  experienceLevel, 
  difficulty,
  thingsToKnow = []
}) => {
  const getDifficultyInfo = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'Facile',
          description: 'Adatto a tutti, non richiede particolare preparazione fisica.',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'medium':
        return {
          label: 'Medio',
          description: 'Richiede una buona forma fisica e spirito di adattamento.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'hard':
        return {
          label: 'Difficile',
          description: 'Richiede ottima forma fisica e esperienza in viaggi avventurosi.',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          label: 'Da valutare',
          description: 'Contattaci per maggiori informazioni sulla difficoltà.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  return (
    <section className="py-16 bg-gray-50" id="things-to-know">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cose da Sapere
            </h2>
            <p className="text-lg text-gray-600">
              Informazioni importanti per il tuo viaggio
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Difficulty Level */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${difficultyInfo.bgColor} rounded-lg flex items-center justify-center`}>
                    <AlertTriangle className={`w-5 h-5 ${difficultyInfo.color}`} />
                  </div>
                  Livello di Difficoltà
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-semibold ${difficultyInfo.color} mb-2`}>
                  {difficultyInfo.label}
                </div>
                <p className="text-gray-600">
                  {difficultyInfo.description}
                </p>
              </CardContent>
            </Card>

            {/* Things to Know from Strapi */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  Consigli Generali
                </CardTitle>
              </CardHeader>
              <CardContent>
                {thingsToKnow.length > 0 ? (
                  <div className="space-y-4">
                    {thingsToKnow.map((item) => (
                      <div key={item.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-start gap-3 mb-2">
                          {item.icon && (
                            <div className="w-6 h-6 flex-shrink-0 mt-1">
                              <img 
                                src={item.icon.url} 
                                alt={item.icon.alternativeText || item.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <h4 className="font-semibold text-gray-900 flex-1">
                            {item.title}
                          </h4>
                        </div>
                        <div 
                          className="text-sm text-gray-600 prose prose-sm max-w-none ml-9"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Nessun consiglio specifico disponibile per questo viaggio.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourThingsToKnow;
