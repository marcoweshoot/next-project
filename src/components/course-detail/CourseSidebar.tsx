
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Award } from 'lucide-react';

const CourseSidebar = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Perché scegliere WeShoot?</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-medium">Metodo provato</h4>
                <p className="text-sm text-gray-600">10+ anni di esperienza nel campo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium">Community attiva</h4>
                <p className="text-sm text-gray-600">Migliaia di fotografi in crescita</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Risultati garantiti</h4>
                <p className="text-sm text-gray-600">Molti allievi pubblicati su riviste</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
       <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">Hai domande?</h3>
        <p className="text-gray-600 mb-4">
        Il nostro team è qui per aiutarti a scegliere il corso più adatto alle tue esigenze.
        </p>

       <a href="mailto:info@weshoot.it" className="w-full block">
       <Button variant="outline" className="w-full">
        Contattaci
       </Button>
      </a>
     </CardContent>
   </Card>

    </div>
  );
};

export default CourseSidebar;
