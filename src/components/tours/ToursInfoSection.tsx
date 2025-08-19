import React from 'react';
import { Users, Star, MapPin } from 'lucide-react';

export default function ToursInfoSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Perché Scegliere i Nostri Viaggi Fotografici?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Piccoli Gruppi</h3>
              <p className="text-gray-600">
                Massimo 10-12 partecipanti per garantire un'attenzione personalizzata
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Coach Esperti</h3>
              <p className="text-gray-600">
                Fotografi professionali che ti guideranno in ogni scatto
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Destinazioni Uniche</h3>
              <p className="text-gray-600">
                Luoghi selezionati per la loro bellezza e potenziale fotografico
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
