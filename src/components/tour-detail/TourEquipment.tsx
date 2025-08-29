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
    <section className="py-16 bg-background" id="equipment">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Attrezzatura e Preparazione
            </h2>
            <p className="text-lg text-muted-foreground">
              Tutto quello che devi sapere per prepararti al meglio
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Esperienza */}
            {experienceLevel && (
              <Card className="h-full bg-card text-card-foreground border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-600/10 dark:bg-red-400/15">
                      <Camera className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-foreground">Livello di Esperienza</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    {experienceLabel}
                  </p>
                  <p className="text-muted-foreground">
                    Questo viaggio è adatto a fotografi di livello {experienceLabel.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attrezzatura */}
            {thingsNeeded && (
              <Card className="h-full bg-card text-card-foreground border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600/10 dark:bg-blue-400/15">
                      <Backpack className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-foreground">Attrezzatura Consigliata</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
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
