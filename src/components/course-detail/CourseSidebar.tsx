// src/components/course-detail/CourseSidebar.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Award } from 'lucide-react';

const FEATURES = [
  {
    Icon: Star,
    title: 'Metodo provato',
    desc: '10+ anni di esperienza nel campo',
    iconColor: 'text-yellow-500',
  },
  {
    Icon: Users,
    title: 'Community attiva',
    desc: 'Migliaia di fotografi in crescita',
    iconColor: 'text-blue-500',
  },
  {
    Icon: Award,
    title: 'Risultati garantiti',
    desc: 'Molti allievi pubblicati su riviste',
    iconColor: 'text-green-500',
  },
] as const;

const CourseSidebar: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* WHY US */}
      <Card className="bg-card text-card-foreground">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-foreground">Perché scegliere WeShoot?</h3>
          <div className="space-y-4">
            {FEATURES.map(({ Icon, title, desc, iconColor }) => (
              <div key={title} className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-1 ${iconColor}`} />
                <div>
                  <h4 className="font-medium text-foreground">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CONTACT */}
      <Card className="bg-card text-card-foreground">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-foreground">Hai domande?</h3>
          <p className="mb-4 text-muted-foreground">
            Il nostro team è qui per aiutarti a scegliere il corso più adatto alle tue esigenze.
          </p>
          <Button asChild className="w-full">
            <a
              href="mailto:info@weshoot.it"
              aria-label="Invia una email a info@weshoot.it"
            >
              Contattaci
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseSidebar;
