
import React from 'react';
import { Clock, Users, MapPin, Star } from 'lucide-react';

const GiftCardInfo: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ma come funziona?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Le Gift Card WeShoot sono incredibilmente semplici e comode da utilizzare. Perfette per sorprendere chi ami con un'esperienza unica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scegli l'importo</h3>
            <p className="text-gray-600">
              Seleziona l'importo della carta regalo tra le opzioni disponibili
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Regala l'esperienza</h3>
            <p className="text-gray-600">
              Consegna la carta regalo alla persona speciale che vuoi sorprendere
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scegli la destinazione</h3>
            <p className="text-gray-600">
              Il destinatario può scegliere tra tutti i nostri viaggi fotografici disponibili
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Viaggia e scatta</h3>
            <p className="text-gray-600">
              Vivi un'esperienza indimenticabile con i migliori coach fotografici
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftCardInfo;
