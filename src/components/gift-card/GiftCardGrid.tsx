
import React from 'react';
import GiftCardItem from './GiftCardItem';

const giftCardOptions = [
  { amount: 50, color: 'bg-red-500', originalPrice: 50 },
  { amount: 100, color: 'bg-yellow-500', originalPrice: 100 },
  { amount: 150, color: 'bg-red-600', originalPrice: 150 },
  { amount: 200, color: 'bg-pink-500', originalPrice: 200 },
  { amount: 250, color: 'bg-red-500', originalPrice: 250 },
  { amount: 300, color: 'bg-orange-500', originalPrice: 300 },
  { amount: 350, color: 'bg-green-600', originalPrice: 350 },
  { amount: 400, color: 'bg-green-400', originalPrice: 400 },
  { amount: 450, color: 'bg-teal-500', originalPrice: 450 },
  { amount: 500, color: 'bg-green-700', originalPrice: 500 },
  { amount: 600, color: 'bg-green-500', originalPrice: 600 },
  { amount: 700, color: 'bg-blue-600', originalPrice: 700 },
  { amount: 800, color: 'bg-blue-500', originalPrice: 800 },
  { amount: 1000, color: 'bg-cyan-500', originalPrice: 1000 },
  { amount: 1400, color: 'bg-purple-600', originalPrice: 1400 }
];

const GiftCardGrid: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giftCardOptions.map((option) => (
            <GiftCardItem
              key={option.amount}
              amount={option.amount}
              color={option.color}
              originalPrice={option.originalPrice}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GiftCardGrid;
