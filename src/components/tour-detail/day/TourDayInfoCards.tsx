
import React from 'react';

interface TourDayInfoCardsProps {
  accommodation?: string;
  meals?: string[];
  activities?: string[];
}

const TourDayInfoCards: React.FC<TourDayInfoCardsProps> = ({ accommodation, meals, activities }) => {
  const hasInfoCards = accommodation || (meals && meals.length > 0);
  const hasActivities = activities && activities.length > 0;

  if (!hasInfoCards && !hasActivities) return null;

  return (
    <>
      {/* Info aggiuntive in card moderne */}
      {hasInfoCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {accommodation && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h6 className="font-bold text-blue-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Alloggio
              </h6>
              <p className="text-blue-800">{accommodation}</p>
            </div>
          )}
          
          {meals && meals.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h6 className="font-bold text-green-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Pasti inclusi
              </h6>
              <p className="text-green-800">{meals.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {hasActivities && (
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <h6 className="font-bold text-purple-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Attività del giorno
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center text-purple-800">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 flex-shrink-0"></div>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TourDayInfoCards;
