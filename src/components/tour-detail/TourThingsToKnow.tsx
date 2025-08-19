'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle } from 'lucide-react';

interface ThingToKnow {
  id: string;
  title: string;
  description: string;
  icon?: {
    url: string;
    alternativeText?: string;
  };
}

interface TourThingsToKnowProps {
  experienceLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  things2know?: ThingToKnow[]; // 👈 uso il nome corretto come da GraphQL
}

const TourThingsToKnow: React.FC<TourThingsToKnowProps> = ({
  experienceLevel,
  difficulty,
  things2know = [], // 👈 default per evitare undefined
}) => {
  const getDifficultyInfo = (level?: string) => {
    switch (level) {
      case 'easy':
        return { label: 'Facile', desc: 'Adatto a tutti...', color: 'text-green-600', bg: 'bg-green-100' };
      case 'medium':
        return { label: 'Medio', desc: 'Richiede una buona forma fisica...', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'hard':
        return { label: 'Difficile', desc: 'Richiede ottima forma fisica...', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { label: 'Da valutare', desc: 'Contattaci per maggiori informazioni...', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  return (
    <section id="things-to-know" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Cose da Sapere</h2>
          <p className="text-lg text-gray-600">Informazioni importanti per il tuo viaggio fotografico</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 ${difficultyInfo.bg} rounded-lg flex items-center justify-center`}>
                  <AlertTriangle className={`w-5 h-5 ${difficultyInfo.color}`} />
                </div>
                Livello di Difficoltà
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-semibold ${difficultyInfo.color} mb-2`}>{difficultyInfo.label}</div>
              <p className="text-gray-600">{difficultyInfo.desc}</p>
            </CardContent>
          </Card>

          {/* Consigli */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                Consigli Generali
              </CardTitle>
            </CardHeader>
            <CardContent>
              {things2know.length > 0 ? (
                <ul className="space-y-6">
                  {things2know.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      {item.icon?.url && (
                        <Image
                          src={item.icon.url}
                          alt={item.icon.alternativeText || item.title}
                          width={24}
                          height={24}
                          className="mt-1 object-contain"
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <div
                          className="text-sm text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Nessun consiglio specifico disponibile.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TourThingsToKnow;
