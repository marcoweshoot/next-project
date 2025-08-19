import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Backpack } from 'lucide-react';

interface TourEquipmentProps {
  thingsNeeded?: string;
  experienceLevel?: string;
}

const TourEquipment: React.FC<TourEquipmentProps> = ({
  thingsNeeded,
  experienceLevel,
}) => {
  if (!thingsNeeded && !experienceLevel) {
    return null;
  }

  const getExperienceLabel = (level?: string): string => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzato';
      case 'expert':
        return 'Esperto';
      default:
        return level || 'Non specificato';
    }
  };

  const experienceLabel = getExperienceLabel(experienceLevel);

  return (
    <section className="py-16" id="equipment">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Attrezzatura e Preparazione
            </h2>
            <p className="text-lg text-gray-600">
              Tutto quello che devi sapere per prepararti al meglio
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Esperienza */}
            {experienceLevel && (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 text-red-600" />
                    </div>
                    Livello di Esperienza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-red-600 mb-2">
                    {experienceLabel}
                  </p>
                  <p className="text-gray-600">
                    Questo viaggio è adatto a fotografi di livello {experienceLabel.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attrezzatura */}
            {thingsNeeded && (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                    >
                      <Backpack className="w-5 h-5 text-blue-600" />
                    </div>
                    Attrezzatura Consigliata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: thingsNeeded }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourEquipment;
